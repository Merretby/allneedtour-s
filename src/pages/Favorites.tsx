import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
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
import productLipstick from "@/assets/product-lipstick.jpg";
import productMask from "@/assets/product-mask.jpg";

interface FavoriteProduct {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  category: string;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    // Demo favorites data
    const demoFavorites: FavoriteProduct[] = [
      {
        id: "1",
        name: "Sérum Visage Vitamine C - Éclat & Anti-âge",
        price: "299 Dhs",
        oldPrice: "399 Dhs",
        image: productSerum,
        category: "Soins",
      },
      {
        id: "2",
        name: "Palette Nude Rose Gold - 12 Teintes",
        price: "249 Dhs",
        image: productPalette,
        category: "Maquillage",
      },
      {
        id: "3",
        name: "Eau de Parfum Rose Élégance 50ml",
        price: "349 Dhs",
        oldPrice: "449 Dhs",
        image: productPerfume,
        category: "Parfums",
      },
      {
        id: "4",
        name: "Crème Hydratante Jour & Nuit",
        price: "199 Dhs",
        image: productCream,
        category: "Soins",
      },
      {
        id: "5",
        name: "Rouge à Lèvres Mat Longue Tenue",
        price: "129 Dhs",
        image: productLipstick,
        category: "Maquillage",
      },
      {
        id: "6",
        name: "Masque Tissu K-Beauty - Lot de 5",
        price: "149 Dhs",
        oldPrice: "199 Dhs",
        image: productMask,
        category: "K-Beauty",
      },
    ];
    setFavorites(demoFavorites);
    setLoading(false);
  };

  const handleRemoveFavorite = (productId: string) => {
    setFavorites(favorites.filter((item) => item.id !== productId));
    toast.success("Produit retiré des favoris");
  };

  const handleAddToCart = (productName: string) => {
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Find the product
    const product = favorites.find(p => p.name === productName);
    if (!product) return;
    
    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex > -1) {
      // Increase quantity if exists
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      currentCart.push({
        id: product.id,
        product_name: product.name,
        product_image: product.image,
        product_price: parseFloat(product.price.replace(' Dhs', '')),
        quantity: 1
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    toast.success(`${productName} ajouté au panier`);
  };

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
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-heading font-bold">Mes Favoris</h1>
        </div>

        {favorites.length === 0 ? (
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
          <>
            <p className="text-muted-foreground mb-6">
              {favorites.length} produit{favorites.length > 1 ? "s" : ""} dans vos favoris
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </button>
                    {product.oldPrice && (
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
                      <p className="font-bold text-primary">{product.price}</p>
                      {product.oldPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {product.oldPrice}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(product.name)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                size="lg"
              >
                Continuer mes achats
              </Button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
