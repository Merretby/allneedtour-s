import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/api/hooks";
import { toNumber } from "@/lib/format";

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

// slug -> category value stored in the database
const categoryFilter: Record<string, string> = {
  skincare: "Skincare",
  capillaire: "Capillaire",
  maquillage: "Maquillage",
  parfums: "Parfums",
  "k-beauty": "K-Beauty",
};

const Category = () => {
  const { slug } = useParams();
  const categoryName = categoryNames[slug || ""] || "Produits";
  const backendCategory = slug ? categoryFilter[slug] : undefined;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useProducts({
    category: backendCategory,
    page,
    limit: 100,
  });

  useEffect(() => {
    setPage(1);
  }, [slug]);

  let products = data?.data ?? [];
  if (slug === "bons-plans") {
    products = products.filter((p) => toNumber(p.compare_at_price) > toNumber(p.price));
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">{categoryName}</h1>

        {isLoading && <p className="text-center text-muted-foreground py-16">Chargement…</p>}

        {isError && (
          <p className="text-center text-destructive py-16">
            Impossible de charger les produits. Vérifiez que l'API est démarrée.
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Aucun produit dans cette catégorie pour le moment.
            </p>
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.pagination.page} sur {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Category;
