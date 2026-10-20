import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Demo products database
  const allProducts = [
    {
      id: 1,
      name: "Crème Hydratante Visage",
      brand: "Dior",
      price: 450,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
      category: "Soin du visage"
    },
    {
      id: 2,
      name: "Sérum Anti-Âge",
      brand: "Lancôme",
      price: 680,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
      category: "Soin du visage"
    },
    {
      id: 3,
      name: "Rouge à Lèvres Mat",
      brand: "YSL",
      price: 320,
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
      category: "Maquillage"
    },
    {
      id: 4,
      name: "Mascara Volume",
      brand: "Maybelline",
      price: 180,
      image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
      category: "Maquillage"
    },
    {
      id: 5,
      name: "Parfum Femme",
      brand: "Chanel",
      price: 1200,
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
      category: "Parfums"
    },
    {
      id: 6,
      name: "Eau de Toilette Homme",
      brand: "Dior",
      price: 950,
      image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400&h=400&fit=crop",
      category: "Parfums"
    },
    {
      id: 7,
      name: "Shampoing Réparateur",
      brand: "Kérastase",
      price: 280,
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
      category: "Soins cheveux"
    },
    {
      id: 8,
      name: "Masque Capillaire",
      brand: "Moroccanoil",
      price: 340,
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
      category: "Soins cheveux"
    },
    {
      id: 9,
      name: "Fond de Teint",
      brand: "Fenty Beauty",
      price: 420,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
      category: "Maquillage"
    },
    {
      id: 10,
      name: "Palette Yeux",
      brand: "Urban Decay",
      price: 560,
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
      category: "Maquillage"
    },
    {
      id: 11,
      name: "Crème Corps",
      brand: "Nivea",
      price: 150,
      image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
      category: "Soin du corps"
    },
    {
      id: 12,
      name: "Huile Essentielle",
      brand: "The Ordinary",
      price: 220,
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
      category: "Soin du visage"
    }
  ];

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success("Produit ajouté au panier");
  };

  const addToFavorites = (product: any) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const exists = favorites.find((item: any) => item.id === product.id);
    
    if (!exists) {
      favorites.push(product);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      toast.success("Produit ajouté aux favoris");
    } else {
      toast.info("Produit déjà dans vos favoris");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Search Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Rechercher</h1>
          
          <form onSubmit={handleSearch} className="relative max-w-3xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit, une marque…"
              className="pl-12 pr-4 py-6 text-lg bg-secondary border-border rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        {searchQuery && (
          <div className="mb-6">
            <p className="text-lg text-muted-foreground">
              {filteredProducts.length > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{filteredProducts.length}</span> résultat{filteredProducts.length > 1 ? 's' : ''} pour "<span className="font-semibold text-foreground">{searchQuery}</span>"
                </>
              ) : (
                <>Aucun résultat pour "<span className="font-semibold text-foreground">{searchQuery}</span>"</>
              )}
            </p>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">Recherchez un produit ou une marque</p>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl smooth-transition group"
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 smooth-transition"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(product);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md smooth-transition"
                  >
                    <Heart className="h-5 w-5 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                  <h3 
                    className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{product.price} Dhs</span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
