import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingCart, Tag, Package, MessageSquare, MapPin, Gift, CreditCard, Store, Clock, Shield, LogOut, LayoutDashboard } from "lucide-react";
import NotificationToggle from "@/components/NotificationToggle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/lib/api/hooks";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: cart } = useCart();
  const cartCount = (cart ?? []).reduce((sum, item) => sum + item.quantity, 0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setProfileOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setProfileOpen(false);
    }, 200);
  };

  const handleSignOut = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="site-header bg-card border-b border-border shadow-sm">
      <div className="site-header__inner flex h-full w-full items-center px-4">
        <div className="flex w-full items-center gap-6">
          {/* Logo */}
          <a href="/" className="site-header__logo flex-shrink-0">
            <img
              src="/logo.jpg"
              alt="AllNeed"
              className="h-16 w-16 rounded object-contain md:h-20 md:w-20"
            />
          </a>

          {/* Search Bar */}
          <div className="hidden min-w-0 flex-1 md:flex">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit, une marque…"
                className="h-11 rounded-full border-border bg-secondary pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Icons */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
            <button 
              onClick={() => navigate("/category/bons-plans")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary hover:text-primary smooth-transition"
            >
              <Tag className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                -25
              </Badge>
            </button>
            
            {isAuthenticated ? (
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary hover:text-primary smooth-transition"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-3 py-2 border-b">
                    <p className="font-semibold text-foreground">Bonjour, {user?.name || user?.email?.split('@')[0] || 'vous'}</p>
                    <p className="text-xs text-muted-foreground">Commandes et Compte</p>
                  </div>
                  
                  <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer py-2">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Vos commandes</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Vos avis</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer py-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>Votre profil</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate("/category/bons-plans")} className="cursor-pointer py-2">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Coupons et offres</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Solde de crédit</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Magasins suivis</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Historique</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Adresses</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Sécurité du compte</span>
                  </DropdownMenuItem>
                  
                  <NotificationToggle />
                  
                  <DropdownMenuSeparator />

                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      className="cursor-pointer py-2"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Administration</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>Changer de compte</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hover:text-primary smooth-transition p-2"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-3 py-2 border-b">
                    <p className="font-semibold text-foreground">Bonjour, visiteur</p>
                    <p className="text-xs text-muted-foreground">Connectez-vous pour accéder à votre compte</p>
                  </div>
                  
                  <DropdownMenuItem onClick={() => navigate("/auth")} className="cursor-pointer py-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>Se connecter / S'inscrire</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate("/category/bons-plans")} className="cursor-pointer py-2">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Coupons et offres</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Magasins</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <button 
              onClick={() => navigate("/favorites")}
              className="hover:text-primary smooth-transition p-2 relative"
            >
              <Heart className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => navigate("/cart")}
              className="hover:text-primary smooth-transition p-2 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher…"
              className="pl-10 bg-secondary border-border rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
