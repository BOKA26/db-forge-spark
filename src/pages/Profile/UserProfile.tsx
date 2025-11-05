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
      vendeur: "/creer-boutique",
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
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: role,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Vous avez déjà ce rôle !");
        } else {
          throw error;
        }
      } else {
        await refetch();
        toast.success(`Rôle ${roleLabels[role].label} ajouté avec succès !`);
        
        // Rediriger vers la page appropriée après l'ajout du rôle
        setTimeout(() => {
          navigate(redirectMap[role]);
        }, 500);
      }
    } catch (e: any) {
      console.error("Erreur ajout rôle:", e);
      toast.error("Impossible d'ajouter le rôle");
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
                  const hasRole = userRoles.includes(role);
                  const RoleIcon = roleLabels[role].icon;
                  
                  return (
                    <Card key={role} className={hasRole ? "border-primary" : ""}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RoleIcon className="h-5 w-5" />
                            <h3 className="font-semibold">{roleLabels[role].label}</h3>
                          </div>
                          {hasRole && (
                            <Badge variant="default">Actif</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {roleLabels[role].description}
                        </p>

                        {hasRole ? (
                          <Button 
                            onClick={() => handleGoToRole(role)}
                            variant="outline"
                            className="w-full"
                          >
                            Accéder
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleAddRole(role)}
                            disabled={addingRole === role}
                            className="w-full"
                          >
                            {addingRole === role ? "Ajout..." : "Ajouter ce rôle"}
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
