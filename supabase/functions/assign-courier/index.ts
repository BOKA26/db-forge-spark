import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create service role client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create anon client to verify the user's JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    // Extract and verify the user's JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header requis' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Token invalide ou expiré' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Utilisateur authentifié:', user.id);

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Recherche d\'un livreur pour la commande:', orderId);

    // Récupérer les infos de la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, products(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Commande introuvable');
    }

    // SECURITY: Verify the caller is the vendor of this order OR an admin
    const isVendor = order.vendeur_id === user.id;
    
    // Check if user is admin
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!isVendor && !isAdmin) {
      console.error('Unauthorized: User', user.id, 'is not vendor', order.vendeur_id, 'or admin');
      return new Response(
        JSON.stringify({ error: 'Seul le vendeur ou un admin peut assigner un livreur' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Autorisation vérifiée - Vendeur:', isVendor, 'Admin:', isAdmin);

    // Trouver les user_ids des livreurs
    const { data: courierRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'livreur')
      .eq('is_active', true);

    if (rolesError || !courierRoles || courierRoles.length === 0) {
      throw new Error('Aucun livreur disponible pour le moment');
    }

    const courierIds = courierRoles.map(r => r.user_id);

    // Filtrer uniquement les livreurs avec statut "actif" dans la table users
    const { data: activeCouriers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id')
      .in('id', courierIds)
      .eq('statut', 'actif')
      .limit(10);

    if (usersError || !activeCouriers || activeCouriers.length === 0) {
      console.log('Aucun livreur actif trouvé parmi:', courierIds);
      throw new Error('Aucun livreur actif disponible pour le moment');
    }

    const couriers = activeCouriers;

    // Sélectionner un livreur aléatoirement (ou le premier disponible)
    const selectedCourier = couriers[Math.floor(Math.random() * couriers.length)];
    const courierId = selectedCourier.id;

    console.log('Livreur sélectionné:', courierId);

    // Générer un code de suivi unique
    const trackingCode = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Vérifier si une delivery existe déjà
    const { data: existingDelivery } = await supabaseAdmin
      .from('deliveries')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingDelivery) {
      // Mettre à jour la delivery existante
      const { error: updateError } = await supabaseAdmin
        .from('deliveries')
        .update({
          livreur_id: courierId,
          statut: 'en_attente',
          tracking_code: trackingCode,
        })
        .eq('id', existingDelivery.id);

      if (updateError) throw updateError;
    } else {
      // Créer une nouvelle delivery
      const { error: deliveryError } = await supabaseAdmin
        .from('deliveries')
        .insert({
          order_id: orderId,
          livreur_id: courierId,
          vendeur_id: order.vendeur_id,
          acheteur_id: order.acheteur_id,
          statut: 'en_attente',
          tracking_code: trackingCode,
        });

      if (deliveryError) throw deliveryError;
    }

    // Mettre à jour la commande avec le livreur sélectionné et le statut en_attente_livreur
    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        livreur_id: courierId,
        statut: 'en_attente_livreur'
      })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Erreur lors de la mise à jour de la commande avec le livreur:', orderUpdateError);
      throw new Error('Erreur lors de la mise à jour de la commande');
    }

    // Construire les infos de livraison pour le livreur
    const destinataire = order.nom_destinataire || 'Non renseigné';
    const telephone = order.telephone_destinataire || 'Non renseigné';
    const adresse = order.adresse_livraison || 'Non renseignée';

    // Envoyer une notification au livreur avec les infos de livraison
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: courierId,
        message: `🚚 Nouvelle livraison disponible!\n📦 Produit: "${order.products?.nom || 'N/A'}"\n👤 Destinataire: ${destinataire}\n📞 Tél: ${telephone}\n📍 Adresse: ${adresse}\n🔗 Code: ${trackingCode}`,
        canal: 'app',
      });

    if (notifError) {
      console.error('Erreur lors de l\'envoi de la notification:', notifError);
    }

    // Envoyer une notification au vendeur
    const { error: vendorNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: order.vendeur_id,
        message: `✅ Un livreur a été assigné à votre commande pour "${order.products?.nom || 'N/A'}". Code de suivi: ${trackingCode}`,
        canal: 'app',
      });

    if (vendorNotifError) {
      console.error('Erreur notification vendeur:', vendorNotifError);
    }

    // Envoyer une notification à l'acheteur
    const { error: buyerNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: order.acheteur_id,
        message: `📦 Votre commande "${order.products?.nom || 'N/A'}" est en cours de traitement. Un livreur a été assigné et vous contactera bientôt. Code de suivi: ${trackingCode}`,
        canal: 'app',
      });

    if (buyerNotifError) {
      console.error('Erreur notification acheteur:', buyerNotifError);
    }

    console.log('Livreur assigné avec succès');

    return new Response(
      JSON.stringify({ 
        success: true, 
        courierId,
        trackingCode,
        message: 'Livreur assigné avec succès'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
