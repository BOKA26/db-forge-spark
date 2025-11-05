import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShoppingCart, Store, Truck } from "lucide-react";
import { toast } from "sonner";

type Role = "acheteur" | "vendeur" | "livreur";

interface ProfileRow {
  id: string;
  full_name?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
  telephone?: string | null;
}

const UserProfile = () => {
  const { user } = useAuth();
  const { data: userRoles = [], refetch } = useUserRoles();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingRole, setAddingRole] = useState<Role | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("id, nom, email, telephone")
          .eq("id", user.id)
          .maybeSingle();

        if (mounted.current) setProfile(data ?? null);
      } catch (e) {
        console.error("Erreur chargement profil:", e);
      }
    })();
  }, [user?.id]);

  const redirectMap = useMemo<Record<Role, string>>(
    () => ({
      acheteur: "/dashboard-acheteur",
      vendeur: "/ma-boutique",
      livreur: "/dashboard-livreur",
    }),
    []
  );

  const roleLabels: Record<Role, { icon: any; label: string; description: string }> = {
    acheteur: {
      icon: ShoppingCart,
      label: "Acheteur",
      description: "Acheter des produits sur la plateforme"
    },
    vendeur: {
      icon: Store,
      label: "Vendeur",
      description: "Créer une boutique et vendre vos produits"
    },
    livreur: {
      icon: Truck,
      label: "Livreur",
      description: "Livrer les commandes des clients"
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email || "",
          nom: profile?.nom || "",
          telephone: profile?.telephone || "",
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil mis à jour avec succès !");
    } catch (e: any) {
      console.error("Erreur sauvegarde profil:", e);
      toast.error("Impossible de sauvegarder le profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddRole = async (role: Role) => {
    if (!user?.id) return;
    
    setAddingRole(role);
    try {
      // Désactiver tous les autres rôles
      await supabase
        .from("user_roles")
        .update({ is_active: false } as any)
        .eq("user_id", user.id);

      // Activer le rôle sélectionné
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: user.id,
          role: role,
          is_active: true,
        } as any, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      await refetch();
      toast.success(`Rôle ${roleLabels[role].label} activé avec succès !`);
      
      // Rediriger vers la page appropriée
      setTimeout(() => {
        navigate(redirectMap[role]);
      }, 500);
    } catch (e: any) {
      console.error("Erreur activation rôle:", e);
      toast.error("Impossible d'activer le rôle");
    } finally {
      setAddingRole(null);
    }
  };

  const handleGoToRole = (role: Role) => {
    navigate(redirectMap[role]);
  };

  if (!user) return null;

  const displayEmail = profile?.email || user.email || "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/40 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profil Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input 
                  id="nom" 
                  value={profile?.nom || ""} 
                  onChange={(e) => setProfile({ ...profile, nom: e.target.value } as ProfileRow)}
                  placeholder="Entrez votre nom complet" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={displayEmail} disabled className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input 
                  id="telephone" 
                  value={profile?.telephone || ""} 
                  onChange={(e) => setProfile({ ...profile, telephone: e.target.value } as ProfileRow)}
                  placeholder="Entrez votre téléphone" 
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={savingProfile}
                className="w-full"
              >
                {savingProfile ? "Enregistrement..." : "Enregistrer le profil"}
              </Button>
            </CardContent>
          </Card>

          {/* Rôles Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Rôles</CardTitle>
              <CardDescription>
                Gérez vos rôles sur la plateforme. Vous commencez en tant qu'acheteur et pouvez ajouter d'autres rôles.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Liste des rôles disponibles */}
              <div className="grid gap-4 md:grid-cols-3">
                {(Object.keys(roleLabels) as Role[]).map((role) => {
                  const roleData = userRoles.find((r: any) => r.role === role);
                  const hasRole = !!roleData;
                  const isActive = (roleData as any)?.is_active || false;
                  const RoleIcon = roleLabels[role].icon;
                  
                  return (
                    <Card key={role} className={isActive ? "border-primary" : ""}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RoleIcon className="h-5 w-5" />
                            <h3 className="font-semibold">{roleLabels[role].label}</h3>
                          </div>
                          {isActive && (
                            <Badge variant="default">Actif</Badge>
                          )}
                          {hasRole && !isActive && (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {roleLabels[role].description}
                        </p>

                        {isActive ? (
                          <Button 
                            onClick={() => handleGoToRole(role)}
                            variant="default"
                            className="w-full"
                          >
                            Accéder
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleAddRole(role)}
                            disabled={addingRole === role}
                            variant={hasRole ? "secondary" : "default"}
                            className="w-full"
                          >
                            {addingRole === role ? "Activation..." : hasRole ? "Activer ce rôle" : "Ajouter ce rôle"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {userRoles.length === 0 && (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">
                    Aucun rôle actif. Commencez par ajouter un rôle ci-dessus.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
