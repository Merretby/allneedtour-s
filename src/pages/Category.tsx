import { useParams } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import productSerum from "@/assets/product-serum.jpg";
import productPalette from "@/assets/product-palette.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productCream from "@/assets/product-cream.jpg";
import productLipstick from "@/assets/product-lipstick.jpg";
import productMask from "@/assets/product-mask.jpg";

const allProducts = [
  {
    id: 1,
    name: "Sérum Visage Vitamine C - Éclat & Anti-âge",
    price: "299 Dhs",
    oldPrice: "399 Dhs",
    image: productSerum,
    category: "skincare",
  },
  {
    id: 2,
    name: "Palette Nude Rose Gold - 12 Teintes",
    price: "249 Dhs",
    image: productPalette,
    category: "maquillage",
  },
  {
    id: 3,
    name: "Eau de Parfum Rose Élégance 50ml",
    price: "349 Dhs",
    oldPrice: "449 Dhs",
    image: productPerfume,
    category: "parfums",
  },
  {
    id: 4,
    name: "Crème Hydratante Jour & Nuit",
    price: "199 Dhs",
    image: productCream,
    category: "skincare",
  },
  {
    id: 5,
    name: "Rouge à Lèvres Mat Longue Tenue",
    price: "129 Dhs",
    image: productLipstick,
    category: "maquillage",
  },
  {
    id: 6,
    name: "Masque Tissu K-Beauty - Lot de 5",
    price: "149 Dhs",
    oldPrice: "199 Dhs",
    image: productMask,
    category: "k-beauty",
  },
  // Bons Plans & Cadeaux products
  {
    id: 7,
    name: "Coffret Cadeau Soin Visage Luxe",
    price: "499 Dhs",
    oldPrice: "699 Dhs",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 8,
    name: "Palette Maquillage Complète - Edition Limitée",
    price: "349 Dhs",
    oldPrice: "499 Dhs",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 9,
    name: "Set de Brosses Maquillage Premium - 12 Pièces",
    price: "279 Dhs",
    oldPrice: "399 Dhs",
    image: "https://images.unsplash.com/photo-1583241800698-a7f2d2e8f0b7?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 10,
    name: "Coffret Parfum + Lotion Corps",
    price: "599 Dhs",
    oldPrice: "799 Dhs",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 11,
    name: "Kit Routine K-Beauty Complète",
    price: "449 Dhs",
    oldPrice: "649 Dhs",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 12,
    name: "Carte Cadeau Para La Grand - 500 Dhs",
    price: "500 Dhs",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 13,
    name: "Set Soins Cheveux Luxueux - 5 Produits",
    price: "399 Dhs",
    oldPrice: "599 Dhs",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
  {
    id: 14,
    name: "Coffret Beauté Découverte - Mini Formats",
    price: "199 Dhs",
    oldPrice: "299 Dhs",
    image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=500&auto=format&fit=crop&q=80",
    category: "bons-plans",
  },
];

const categoryNames: Record<string, string> = {
  "bons-plans": "Bons Plans & Cadeaux",
  "k-beauty": "K-Beauty",
  skincare: "Skincare",
  capillaire: "Capillaire",
  maquillage: "Maquillage",
  parfums: "Parfums",
  "sante-bien-etre": "Santé & Bien-être",
  "corps-bain": "Corps & Bain",
  nouveautes: "Nouveautés & Tendances",
  marques: "Marques",
};

const Category = () => {
  const { slug } = useParams();
  const categoryName = categoryNames[slug || ""] || "Produits";

  const filteredProducts = slug
    ? allProducts.filter((p) => p.category === slug)
    : allProducts;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">{categoryName}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <a key={product.id} href={`/product/${product.id}`}>
              <ProductCard {...product} />
            </a>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Aucun produit dans cette catégorie pour le moment.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Category;
