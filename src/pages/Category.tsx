import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import PriceFilter from "@/components/PriceFilter";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { categoryFilter } from "@/lib/category-filters";
const categoryNames: Record<string, string> = {
  "bons-plans": "Bons Plans & Cadeaux",
  "k-beauty": "K-Beauty",
  skincare: "Skincare",
  capillaire: "Capillaire",
  maquillage: "Maquillage",
  parfums: "Parfums",
  "sante-bien-etre": "Santé & Bien-être",
  "corps-bain": "Corps & Bain",
  "hygiene-bebe": "Hygiène & Bébé",
  "sante-nutrition": "Santé & Nutrition",
  "sport-fitness": "Sport & Fitness",
  "bio-maison": "Bio & Maison",
  nouveautes: "Nouveautés & Tendances",
  marques: "Marques",
};

const categoryAliases: Record<string, string> = {
  "À -25%": "LES BONS DEALS",
  "PETITS PRIX": "LES BONS DEALS",
  "COFFRETS CADEAUX": "COFFRETS",
  "CARTES-CADEAUX": "COFFRETS",
  "JEUX CONCOURS": "PROMOTIONS DIVERSES",
  "ÉVÉNEMENTS SPÉCIAUX": "PROMOTIONS DIVERSES",
  "SÉRUMS CORÉENS": "PRODUITS COREENS",
  "MASQUES TISSU": "MASQUES ET CREMES",
  "MASQUES CRÈME": "MASQUES ET CREMES",
  "ROUTINE CORÉENNE": "PRODUITS COREENS",
  "DOUBLE NETTOYAGE": "DEMAQUILLANTS ET NETTOYANTS",
  "MARQUES K-BEAUTY": "PRODUITS COREENS",
  ESSENCE: "SERUMS ET HUILES",
  CICA: "SOINS HYDRATANTS",
  "PROTÉINES": "PROTÉINES",
  "COMPLÉMENTS SPORTIFS": "COMPLÉMENTS SPORTIFS",
  "NUTRITION SPORTIVE": "NUTRITION SPORT",
  "BARRES & ENCAS SPORTIFS": "BARRES &amp; ENCAS SPORTIFS",
  "ÉNERGIE & HYDRATATION": "ÉNERGIE ET HYDRATATION",
  "RÉCUPÉRATION": "RÉCUPÉRATION",
  "SÉRUMS": "SERUMS ET HUILES",
  "CRÈMES JOUR/NUIT": "CREMES JOUR",
  "CONTOUR DES YEUX": "SOINS CONTOURS YEUX",
  "MASQUES": "MASQUES ET CREMES",
  "NETTOYANTS": "DEMAQUILLANTS ET NETTOYANTS",
  "NETTOYANTS VISAGE": "DEMAQUILLANTS ET NETTOYANTS",
  "ANTI-ÂGE": "SOINS ANTI AGE",
  "ANTI-IMPERFECTIONS": "SOINS ANTI IMPERFECTIONS",
  HYDRATATION: "SOINS HYDRATANTS",
  "SOINS CIBLÉS": "SOINS ANTI IMPERFECTIONS",
  "SOLAIRE VISAGE": "CREMES SOLAIRES",
  "SHAMPOOING": "SHAMPOINGS USAGE FREQUENT",
  "APRÈS-SHAMPOOING": "APRES SHAMPOING",
  "MASQUES CHEVEUX": "SOINS CHEVEUX VISAGE ET CORPS",
  "HUILE CHEVEUX": "SOINS CHEVEUX VISAGE ET CORPS",
  "COLORATION": "COLORATION CHEVEUX",
  "SHAMPOOING SEC": "SHAMPOING SEC",
  "ACCESSOIRES": "ACCESSOIRES POUR CHEVEUX",
  "ANTI-CHUTE": "SHAMPOINGS ANTI-CHUTE",
  "TEINT": "FONDS DE TEINT",
  "FOND DE TEINT": "FONDS DE TEINT",
  "YEUX": "YEUX",
  "LÈVRES": "LEVRES",
  "ONGLES": "ONGLES",
  "PARFUMS FEMME": "PARFUMS",
  "PARFUMS HOMME": "PARFUMS",
  "COFFRETS": "COFFRETS",
  "HYGIÈNE VISAGE": "DEMAQUILLANTS ET NETTOYANTS",
  "DEMAQUILLANTS ET NETTOYANTS": "DEMAQUILLANTS ET NETTOYANTS",
  "HYGIÈNE BUCCO-DENTAIRE": "DENTIFRICES",
  "BROSSES À DENTS": "BROSSES A DENTS ADULTES",
  "DENTIFRICES": "DENTIFRICES",
  "HYGIÈNE INTIME": "HYGIENE INTIME",
  "BÉBÉ": "BEBES ET MAMANS",
  "CHANGES BÉBÉ": "CHANGES BEBE",
  "BIBERONS": "BIBERON ET GOUPILLON",
  "SUCETTES": "SUCETTES ET ATTACHES SUCETTES",
  "COMPLÉMENTS ALIMENTAIRES": "COMPLEMENTS ALIMENTAIRES",
  "VITAMINES ET FORMES": "VITAMINES ET FORMES",
  "ÉNERGIE ET IMMUNITÉ": "DEFENSES IMMUNITAIRES",
  "ÉNERGIE ET HYDRATATION": "ÉNERGIE ET HYDRATATION",
  "DÉFENSES IMMUNITAIRES": "DEFENSES IMMUNITAIRES",
  "DIGESTION ET SOMMEIL": "SOMMEIL ET DETENTE",
  "TRANSIT DIGESTION ET ÉLIMINATION": "TRANSIT DIGESTION ET ELIMINATION",
  "HUILES ESSENTIELLES": "HUILES ESSENTIELLES",
  "COSMÉTIQUES BIO": "COSMETIQUE BIO",
  "PRODUITS BIO VISAGE ET CORPS": "PRODUITS BIO VISAGE ET CORPS",
  "HYGIÈNE BIO": "PRODUITS HYGIENE BIO",
  "PRODUITS HYGIÈNE BIO": "PRODUITS HYGIENE BIO",
  "ALIMENTATION BIO": "ALIMENTATION BIO ET NATUREL",
  "HYGIÈNE MAISON": "HYGIENE MAISON",
  "ENTRETIEN DE LA MAISON": "ENTRETIEN DE LA MAISON",
};

const Category = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const categoryName = categoryNames[slug || ""] || "Produits";
  const requestedCategory = searchParams.get("category");
  const requestedLabel = requestedCategory?.split("/").pop()?.trim();
  const exactCategory = requestedCategory
    ? requestedLabel && categoryAliases[requestedLabel.toUpperCase()]
      ? categoryAliases[requestedLabel.toUpperCase()]
      : requestedCategory.includes("/")
        ? categoryFilter[slug || ""]?.join(",")
        : categoryAliases[requestedCategory.toUpperCase()] ??
          (categoryFilter[slug || ""] ? undefined : requestedCategory)
    : undefined;
  const backendCategory =
    exactCategory ||
    (slug ? categoryFilter[slug]?.join(",") : undefined);
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const productsQuery = useProducts({
    category: backendCategory,
    page,
    limit: 100,
    minPrice: priceRange?.[0],
    maxPrice: priceRange?.[1],
  });
  const { data, isLoading, isError } = productsQuery;
  const errorMessage =
    productsQuery.error instanceof ApiError
      ? productsQuery.error.message
      : "Vérifiez que l'API est démarrée.";

  useEffect(() => {
    setPage(1);
    setPriceRange(null);
  }, [slug, backendCategory]);

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const bounds = data?.priceRange;

  useEffect(() => {
    if (!bounds) return;
    setPriceRange((current) => current ?? [Math.floor(bounds.min), Math.ceil(bounds.max)]);
  }, [bounds]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto min-w-0 px-4 py-8 md:ml-64 md:w-[calc(100%-16rem)]">
        <h1 className="text-3xl font-heading font-bold mb-8">{categoryName}</h1>

        {isLoading && <p className="text-center text-muted-foreground py-16">Chargement…</p>}

        {isError && (
          <p className="text-center text-destructive py-16">
            Impossible de charger les produits. {errorMessage}
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <PriceFilter
            min={Math.floor(bounds?.min ?? 0)}
            max={Math.ceil(bounds?.max ?? 0)}
            value={priceRange ?? [Math.floor(bounds?.min ?? 0), Math.ceil(bounds?.max ?? 0)]}
            onChange={(nextRange) => {
              setPriceRange(nextRange);
              setPage(1);
            }}
          />
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
