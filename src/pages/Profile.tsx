import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Edit2, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useFavorites, useOrders, useUpdateProfile } from "@/lib/api/hooks";
import { formatPrice, toNumber } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { data: orders } = useOrders();
  const { data: favorites } = useFavorites();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  const orderCount = orders?.data.length ?? 0;
  const totalSpent = (orders?.data ?? []).reduce((sum, order) => sum + toNumber(order.total), 0);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, email, phone });
      setEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de mettre à jour le profil");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">Mon Profil</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/orders")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mes commandes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/favorites")}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Mes favoris
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Informations personnelles</h2>
                {!editing && (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Nom complet
                  </label>
                  {editing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  ) : (
                    <p className="text-foreground font-medium">{user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Numéro de téléphone
                  </label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      minLength={6}
                      maxLength={30}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{user?.phone || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </label>
                  {editing ? (
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{user?.email}</p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="flex-1" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setName(user?.name ?? "");
                        setEmail(user?.email ?? "");
                        setPhone(user?.phone ?? "");
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{orderCount}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-foreground">{favorites?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
