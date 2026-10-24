import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAddToCart, useFavorites, useProduct, useToggleFavorite } from "@/lib/api/hooks";
import {
  discountPercent,
  formatPrice,
  resolveImageUrl,
  toNumber,
} from "@/lib/format";
import { ApiError } from "@/lib/api/client";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: product, isLoading, isError } = useProduct(id);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const { data: favorites } = useFavorites();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  const isFavorite = Boolean(favorites?.some((item) => item.product_id === id));

  const requireAuth = (message: string): boolean => {
    if (!isAuthenticated) {
      toast.info(message);
      navigate("/auth");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!requireAuth("Connectez-vous pour ajouter au panier")) return;

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
      toast.success("Produit ajouté au panier");
      setTimeout(() => navigate("/cart"), 600);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible d'ajouter au panier");
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    if (!requireAuth("Connectez-vous pour gérer vos favoris")) return;

    try {
      const result = await toggleFavorite.mutateAsync(product.id);
      toast.success(result.added ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de modifier les favoris");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Chargement du produit…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-heading font-bold mb-4">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Désolé, ce produit n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate("/")} size="lg">
            Retour à l'accueil
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const price = toNumber(product.price);
  const compareAt = toNumber(product.compare_at_price);
  const promo = discountPercent(price, compareAt);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto min-w-0 px-4 py-8 md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-secondary rounded-xl overflow-hidden">
            <img
              src={resolveImageUrl(product.image_url)}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.svg";
              }}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
                <span className="text-muted-foreground">(128 avis)</span>
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-foreground">{formatPrice(price)}</span>
              {promo !== null && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(compareAt)}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
                    Promo -{promo} %
                  </Badge>
                </>
              )}
            </div>

            <p className={product.stock > 0 ? "text-sm text-green-600" : "text-sm text-destructive"}>
              {product.stock > 0 ? `En stock (${product.stock})` : "Rupture de stock"}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-secondary smooth-transition"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-border">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  className="px-4 py-2 hover:bg-secondary smooth-transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock <= 0}
                className="flex-1 gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock <= 0
                  ? "Rupture de stock"
                  : addToCart.isPending
                  ? "Ajout..."
                  : "Ajouter au panier"}
              </Button>
              <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
