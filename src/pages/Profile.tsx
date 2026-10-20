import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Edit2, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Hanane Douch",
    email: "hanane.douch@example.com",
    phone: "0660****30",
    address: "Casablanca, Maroc",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const userSession = localStorage.getItem('userSession');
    setUser(userSession ? JSON.parse(userSession) : null);
  };

  const handleSave = () => {
    setEditing(false);
    toast.success("Profil mis à jour avec succès");
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
                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
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
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.name}</p>
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
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Téléphone
                  </label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Adresse
                  </label>
                  {editing ? (
                    <Input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.address}</p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="flex-1">
                      Enregistrer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
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
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-2xl font-bold text-foreground">1,095 Dhs</p>
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
