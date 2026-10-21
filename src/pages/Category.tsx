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

// Navbar groups mapped to the category values stored in the imported catalog.
const categoryFilter: Record<string, string[]> = {
  "k-beauty": ["PRODUITS COREENS"],
  skincare: [
    "SOINS HYDRATANTS",
    "MASQUES ET CREMES",
    "SOINS ECLAIRCISSANTS ET ANTI PIGMENTS",
    "SOINS ANTI AGE",
    "CREMES JOUR",
    "SOINS ANTI ACNE",
    "SOINS ANTI IMPERFECTIONS",
    "SERUMS ET HUILES",
    "ACCESSOIRES DE SOINS VISAGE",
    "SOINS CONTOURS YEUX",
    "MASQUES VISAGE",
    "CREMES SOLAIRES",
    "GELS SOLAIRE",
  ],
  capillaire: [
    "ACCESSOIRES POUR CHEVEUX",
    "CAPILLAIRE - DERCOS",
    "COLORATION CHEVEUX",
    "SHAMPOING CHEVEUX COLORES",
    "SOIN CAPILLAIRE PREMIUM",
    "ANTI-POUX",
    "APRES SHAMPOING",
    "SHAMPOING CHEVEUX SECS",
    "SPRAYS VOLUME CHEVEUX",
    "SHAMPOING SEC",
    "SHAMPOINGS ANTI-CHUTE",
    "SOINS CHEVEUX VISAGE ET CORPS",
    "GELS COIFFANTS",
    "LAQUES CHEVEUX",
    "SHAMPOINGS USAGE FREQUENT",
    "PRODUITS COIFFANTS",
    "SHAMPOING CHEVEUX GRAS",
    "ANTI CHUTE",
    "RACINE",
    "PRODUITS AMERICAINS CHEVEUX",
  ],
  maquillage: [
    "MAKE UP YOUR MIND",
    "YEUX ET SOURCILS",
    "LIPSTICK DAY",
    "LEVRES",
    "ACCESSOIRES DE MAQUILLAGES",
    "FONDS DE TEINT",
    "MAQUILLAGE - MAKEUP",
    "YEUX",
    "ONGLES",
    "BLUSH",
    "POUDRES",
    "GLOW",
    "LIPS MAYBELLINE",
  ],
  parfums: ["PARFUMS"],
  "sante-bien-etre": [
    "COMPLEMENTS CHEVEUX ET ONGLES",
    "COMPLEMENTS ALIMENTAIRES",
    "DENTIFRICES",
    "POMMADES ET CREMES CICATRISANTES",
    "FASHION BEBE ET ENFANT",
    "CHANGES BEBE",
    "COU DOS ET POSTURE",
  ],
  "corps-bain": ["SOINS MAINS ET PIEDS", "PRODUITS AMERICAINS VISAGE ET CORPS"],
};

const Category = () => {
  const { slug } = useParams();
  const categoryName = categoryNames[slug || ""] || "Produits";
  const backendCategory = slug ? categoryFilter[slug]?.join(",") : undefined;
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
