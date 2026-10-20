import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAddToCart, useFavorites, useToggleFavorite } from "@/lib/api/hooks";
import { formatPrice, resolveImageUrl, toNumber } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

const Favorites = () => {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading, isError } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const addToCart = useAddToCart();

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await toggleFavorite.mutateAsync(productId);
      toast.success("Produit retiré des favoris");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible de retirer le favori");
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 });
      toast.success(`${productName} ajouté au panier`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Impossible d'ajouter au panier");
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
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-heading font-bold">Mes Favoris</h1>
        </div>

        {isError && (
          <p className="text-center text-destructive py-16">
            Impossible de charger les favoris. Vérifiez que l'API est démarrée.
          </p>
        )}

        {!isError && favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              Vous n'avez pas encore de favoris
            </p>
            <p className="text-muted-foreground mb-8">
              Parcourez nos produits et ajoutez vos coups de cœur !
            </p>
            <Button onClick={() => navigate("/")} size="lg">
              Découvrir nos produits
            </Button>
          </div>
        ) : (
          !isError && (
            <>
              <p className="text-muted-foreground mb-6">
                {favorites.length} produit{favorites.length > 1 ? "s" : ""} dans vos favoris
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {favorites.map((favorite) => {
                  const product = favorite.product;
                  const price = toNumber(product.price);
                  const compareAt = toNumber(product.compare_at_price);
                  return (
                    <div
                      key={favorite.id}
                      className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group"
                    >
                      <div
                        className="relative aspect-square overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <img
                          src={resolveImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(product.id);
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                        >
                          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        </button>
                        {compareAt > price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Promo
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="font-bold text-primary">{formatPrice(price)}</p>
                          {compareAt > price && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(compareAt)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddToCart(product.id, product.name)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Ajouter au panier
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
