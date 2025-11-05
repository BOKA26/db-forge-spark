import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

/* ---------- Types ---------- */
type Role = "acheteur" | "vendeur" | "livreur";

interface ProfileRow {
  id: string;
  // on accepte tes deux conventions de colonnes
  full_name?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
  telephone?: string | null;
}

interface UserRoleRow {
  user_id: string;
  role: Role;
}

/* ---------- Composant ---------- */
const UserProfile = () => {
  const { user } = useAuth();
  const { data: currentRole, refetch } = useUserRole();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // charge/maj du profil
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

  // role affiché par défaut
  useEffect(() => {
    if (currentRole && mounted.current) setSelectedRole(currentRole as Role);
  }, [currentRole]);

  const redirectMap = useMemo<Record<Role, string>>(
    () => ({
      acheteur: "/dashboard-acheteur",
      vendeur: "/ma-boutique",
      livreur: "/dashboard-livreur",
    }),
    []
  );

  const goToRoleDashboard = (role: Role) => navigate(redirectMap[role]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
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
      if (mounted.current) setSavingProfile(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!user?.id || !selectedRole) {
      toast.error("Utilisateur ou rôle manquant.");
      return;
    }

    setLoading(true);
    try {
      // Vérifie si l'utilisateur a déjà ce rôle
      const { data: existing, error: checkErr } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", user.id)
        .eq("role", selectedRole);

      if (checkErr) {
        console.error("Erreur check roles:", checkErr);
        throw checkErr;
      }

      if (existing && existing.length > 0) {
        toast.success("Rôle confirmé ! Redirection…");
        goToRoleDashboard(selectedRole);
        return;
      }

      // Insertion (si tu as une contrainte UNIQUE (user_id, role), on est safe)
      const { error: insertErr } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: selectedRole,
        });

      if (insertErr) {
        console.error("Erreur insertion rôle:", insertErr);
        throw insertErr;
      }

      await refetch();
      toast.success("Rôle enregistré ! Redirection…");
      goToRoleDashboard(selectedRole);
    } catch (e: any) {
      console.error("Erreur rôle:", e);
      toast.error(e?.message ?? "Impossible d'enregistrer le rôle.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  if (!user) return null;

  const displayName = profile?.full_name || profile?.nom || "";
  const displayEmail = profile?.email || user.email || "";
  const displayPhone = profile?.phone || profile?.telephone || "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/40 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et choisissez votre rôle
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
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
                  <Input id="email" value={displayEmail} placeholder="Non renseigné" disabled className="bg-muted/50" />
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
                  {savingProfile ? "⏳ Enregistrement..." : "💾 Enregistrer le profil"}
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-4">
                  {!selectedRole && (
                    <Alert variant="destructive" className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 dark:border-yellow-700">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        <strong>⚠️ Action requise :</strong> Vous devez sélectionner un rôle ci-dessous pour accéder aux fonctionnalités de la plateforme.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Choisissez votre rôle</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sélectionnez votre rôle. Vous serez redirigé automatiquement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Votre rôle</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(v: Role) => setSelectedRole(v)}
                      disabled={loading || !!currentRole}
                    >
                      <SelectTrigger><SelectValue placeholder="-- Sélectionnez un rôle --" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acheteur">🛒 Acheteur</SelectItem>
                        <SelectItem value="vendeur">🏪 Vendeur</SelectItem>
                        <SelectItem value="livreur">🚚 Livreur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole && !currentRole && (
                    <Button onClick={handleRoleSubmit} disabled={loading} className="w-full" size="lg">
                      {loading ? "⏳ Enregistrement..." : "✅ Valider mon rôle et accéder au dashboard"}
                    </Button>
                  )}

                  {currentRole && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Rôle actuel :</strong>{" "}
                        {currentRole === "acheteur" && "🛒 Acheteur"}
                        {currentRole === "vendeur" && "🏪 Vendeur"}
                        {currentRole === "livreur" && "🚚 Livreur"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
