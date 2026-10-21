import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/api/hooks";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const current = searchParams.get("q") || "";
    if (current !== debouncedQuery) {
      setSearchParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { data, isLoading, isError } = useProducts({
    search: debouncedQuery || undefined,
    page,
    limit: 60,
  });

  const products = data?.data ?? [];
  const totalResults = data?.pagination.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <TopBar />
      <Header />
      <Navigation />

      {/* Search Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Rechercher</h1>

          <form onSubmit={(e) => e.preventDefault()} className="relative max-w-3xl">
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
        {debouncedQuery && !isLoading && (
          <div className="mb-6">
            <p className="text-lg text-muted-foreground">
              {totalResults > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{totalResults}</span> résultat
                  {totalResults > 1 ? "s" : ""} pour "
                  <span className="font-semibold text-foreground">{debouncedQuery}</span>"
                </>
              ) : (
                <>
                  Aucun résultat pour "
                  <span className="font-semibold text-foreground">{debouncedQuery}</span>"
                </>
              )}
            </p>
          </div>
        )}

        {isLoading && debouncedQuery && (
          <p className="text-center text-muted-foreground py-16">Recherche…</p>
        )}

        {isError && (
          <p className="text-center text-destructive py-16">
            Impossible de charger les produits. Vérifiez que l'API est démarrée.
          </p>
        )}

        {!debouncedQuery && (
          <div className="text-center py-16">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">Recherchez un produit ou une marque</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
      </div>

      <Footer />
    </div>
  );
};

export default Search;
