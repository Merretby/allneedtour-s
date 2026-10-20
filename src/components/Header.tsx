import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingCart, Tag, Package, MessageSquare, MapPin, Gift, CreditCard, Store, Clock, Shield, Bell, LogOut } from "lucide-react";
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

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
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

  useEffect(() => {
    // Check if user is logged in via localStorage
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
    
    // Update cart count from localStorage
    updateCartCount();
    
    // Listen for cart updates
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(total);
  };

  const handleSignOut = () => {
    localStorage.removeItem('userSession');
    setUser(null);
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
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img 
              src="/logo_para.svg" 
              alt="Para La Grand" 
              className="h-20 md:h-24 w-auto"
            />
          </a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit, une marque…"
                className="pl-10 bg-secondary border-border rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => navigate("/category/bons-plans")}
              className="hover:text-primary smooth-transition p-2 relative"
            >
              <Tag className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                -25
              </Badge>
            </button>
            
            {user ? (
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
                    <p className="font-semibold text-foreground">Bonjour, {user.email?.split('@')[0] || 'hanane'}</p>
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
                  
                  <DropdownMenuItem className="cursor-pointer py-2">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
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
