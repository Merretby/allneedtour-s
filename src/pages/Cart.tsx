import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, Package, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  useCart,
  useCreateOrder,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/lib/api/hooks";
import { computeShipping, formatPrice, resolveImageUrl, toNumber } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

const Cart = () => {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading, isError } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const createOrder = useCreateOrder();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + toNumber(item.product.price) * item.quantity,
    0
  );
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;
  const articleCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de mettre à jour le panier");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem.mutateAsync(itemId);
      toast.success("Produit retiré du panier");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de retirer le produit");
    }
  };

  const handleCheckout = async () => {
    try {
      await createOrder.mutateAsync();
      toast.success("Commande passée avec succès!");
      navigate("/orders");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de passer la commande");
    }
  };

  if (isLoading) {
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

        {isError && (
          <p className="text-center text-destructive py-16">
            Impossible de charger le panier. Vérifiez que l'API est démarrée.
          </p>
        )}

        {!isError && cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Votre panier est vide</p>
            <Button onClick={() => navigate("/")}>Continuer mes achats</Button>
          </div>
        ) : (
          !isError && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const unitPrice = toNumber(item.product.price);
                  return (
                    <div
                      key={item.id}
                      className="bg-card rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={resolveImageUrl(item.product.image_url)}
                        alt={item.product.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {item.product.name}
                        </h3>
                        <p className="text-xl font-bold text-primary mb-4">
                          {formatPrice(unitPrice)}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-4 py-2 hover:bg-secondary transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-6 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                          {formatPrice(unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card rounded-xl p-6 border border-border h-fit shadow-md">
                <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total ({articleCount} articles)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className="font-semibold">
                      {shipping === 0 ? "Gratuit" : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping === 0 ? (
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      ✓ Vous bénéficiez de la livraison gratuite!
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                      Plus que {formatPrice(60 - subtotal)} pour la livraison gratuite!
                    </p>
                  )}
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button
                  className="w-full mb-3"
                  size="lg"
                  disabled={createOrder.isPending}
                  onClick={handleCheckout}
                >
                  {createOrder.isPending ? "Traitement..." : "Passer la commande"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Continuer mes achats
                </Button>
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
