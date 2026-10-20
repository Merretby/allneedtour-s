import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const mockProducts = [
  {
    id: 1,
    name: "Sérum Visage Vitamine C - Éclat & Anti-âge",
    price: "299 Dhs",
    oldPrice: "399 Dhs",
    image: productSerum,
    description: "Un sérum concentré en vitamine C pour illuminer et raffermir la peau.",
    category: "Skincare",
  },
  {
    id: 2,
    name: "Palette Nude Rose Gold - 12 Teintes",
    price: "249 Dhs",
    image: productPalette,
    description: "Une palette d'ombres à paupières aux tons roses et dorés pour un look sophistiqué.",
    category: "Maquillage",
  },
  {
    id: 3,
    name: "Eau de Parfum Rose Élégance 50ml",
    price: "349 Dhs",
    oldPrice: "449 Dhs",
    image: productPerfume,
    description: "Un parfum floral et élégant aux notes de rose et de jasmin.",
    category: "Parfums",
  },
  {
    id: 4,
    name: "Crème Hydratante Jour & Nuit",
    price: "199 Dhs",
    image: productCream,
    description: "Une crème riche en actifs hydratants pour une peau douce et nourrie.",
    category: "Skincare",
  },
  {
    id: 5,
    name: "Rouge à Lèvres Mat Longue Tenue",
    price: "129 Dhs",
    image: productLipstick,
    description: "Un rouge à lèvres mat qui tient toute la journée sans dessécher.",
    category: "Maquillage",
  },
  {
    id: 6,
    name: "Masque Tissu K-Beauty - Lot de 5",
    price: "149 Dhs",
    oldPrice: "199 Dhs",
    image: productMask,
    description: "Pack de masques en tissu coréens pour une peau éclatante et hydratée.",
    category: "K-Beauty",
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const product = mockProducts.find((p) => p.id === parseInt(id || "0"));

  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    setUser(userSession ? JSON.parse(userSession) : null);
  }, []);

  if (!product) {
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

  const handleAddToCart = async () => {
    // Add to localStorage cart
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id.toString());
    
    if (existingItemIndex > -1) {
      // Increase quantity if exists
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      currentCart.push({
        id: product.id.toString(),
        product_name: product.name,
        product_image: product.image,
        product_price: parseFloat(product.price.replace(' Dhs', '')),
        quantity: quantity
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    toast.success("Produit ajouté au panier");
    setTimeout(() => navigate("/cart"), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-secondary rounded-xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
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
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-primary text-primary"
                  />
                ))}
                <span className="text-muted-foreground">(128 avis)</span>
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                {product.price}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.oldPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-secondary smooth-transition"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-secondary smooth-transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex-1 gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {loading ? "Ajout..." : "Ajouter au panier"}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
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
