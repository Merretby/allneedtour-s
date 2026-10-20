import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, Package, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import productSerum from "@/assets/product-serum.jpg";
import productPalette from "@/assets/product-palette.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productCream from "@/assets/product-cream.jpg";

interface CartItem {
  id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const userSession = localStorage.getItem('userSession');
    setUser(userSession ? JSON.parse(userSession) : null);
    // Load cart items from localStorage
    loadCart();
  };

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (savedCart.length > 0) {
      setCartItems(savedCart);
    } else {
      // Load demo cart items if no saved cart
      const demoItems: CartItem[] = [
        {
          id: "1",
          product_name: "Sérum Visage Vitamine C - Éclat & Anti-âge",
          product_image: productSerum,
          product_price: 299,
          quantity: 1,
        },
        {
          id: "2",
          product_name: "Palette Nude Rose Gold - 12 Teintes",
          product_image: productPalette,
          product_price: 249,
          quantity: 2,
        },
        {
          id: "3",
          product_name: "Eau de Parfum Rose Élégance 50ml",
          product_image: productPerfume,
          product_price: 349,
          quantity: 1,
        },
        {
          id: "4",
          product_name: "Crème Hydratante Jour & Nuit",
          product_image: productCream,
          product_price: 199,
          quantity: 1,
        },
      ];
      setCartItems(demoItems);
      localStorage.setItem('cart', JSON.stringify(demoItems));
    }
    setLoading(false);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success("Produit retiré du panier");
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">Mon Panier</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2"
          >
            <Package className="h-5 w-5" />
            Suivre mes commandes
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              Votre panier est vide
            </p>
            <Button onClick={() => navigate("/")}>
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{item.product_name}</h3>
                    <p className="text-xl font-bold text-primary mb-4">
                      {item.product_price} Dhs
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-4 py-2 hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-6 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-4 py-2 hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Sous-total</p>
                    <p className="text-xl font-bold text-foreground">
                      {(item.product_price * item.quantity).toFixed(2)} Dhs
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-6 border border-border h-fit shadow-md">
              <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} articles)</span>
                  <span className="font-semibold">{total.toFixed(2)} Dhs</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span className="font-semibold">{total >= 60 ? "Gratuit" : "30 Dhs"}</span>
                </div>
                {total >= 60 && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    ✓ Vous bénéficiez de la livraison gratuite!
                  </p>
                )}
                {total < 60 && (
                  <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                    Plus que {(60 - total).toFixed(2)} Dhs pour la livraison gratuite!
                  </p>
                )}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {(total + (total >= 60 ? 0 : 30)).toFixed(2)} Dhs
                  </span>
                </div>
              </div>
              <Button 
                className="w-full mb-3" 
                size="lg"
                onClick={() => {
                  toast.success("Commande passée avec succès!");
                  setTimeout(() => navigate("/orders"), 1500);
                }}
              >
                Passer la commande
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/")}
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
