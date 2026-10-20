import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/lib/api/types";
import { useAddToCart, useFavorites, useToggleFavorite } from "@/lib/api/hooks";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, resolveImageUrl, toNumber } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const { data: favorites } = useFavorites();

  const isFavorite = Boolean(favorites?.some((item) => item.product_id === product.id));
  const compareAt = toNumber(product.compare_at_price);
  const price = toNumber(product.price);

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter au panier");
      navigate("/auth");
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      toast.success("Produit ajouté au panier");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible d'ajouter au panier");
    }
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Connectez-vous pour gérer vos favoris");
      navigate("/auth");
      return;
    }

    try {
      const result = await toggleFavorite.mutateAsync(product.id);
      toast.success(result.added ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de modifier les favoris");
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover-lift border border-border cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={resolveImageUrl(product.image_url)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
        />
        <button
          onClick={handleToggleFavorite}
          aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card smooth-transition"
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`}
          />
        </button>
        {compareAt > price && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-semibold">
            Promo
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{formatPrice(price)}</span>
          {compareAt > price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={addToCart.isPending || product.stock <= 0}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
