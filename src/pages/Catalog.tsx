import { useCallback, useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import PriceFilter from "@/components/PriceFilter";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

const Catalog = () => {
  const [page, setPage] = useState(1);
  const productsQuery = useProducts({ page, limit: 100 });
  const { data, isLoading, isError } = productsQuery;
  const products = data?.data ?? [];
  const [filteredProducts, setFilteredProducts] = useState(products);
  const pagination = data?.pagination;
  const errorMessage =
    productsQuery.error instanceof ApiError
      ? productsQuery.error.message
      : "Vérifiez que l'API est démarrée.";
  const handleFilteredProducts = useCallback((nextProducts: typeof products) => {
    setFilteredProducts(nextProducts);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto min-w-0 px-4 py-8 md:ml-64 md:w-[calc(100%-16rem)]">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold">Tous les produits</h1>
          {pagination && (
            <p className="mt-2 text-sm text-muted-foreground">
              {pagination.total} produits disponibles
            </p>
          )}
        </div>

        {isLoading && (
          <p className="py-16 text-center text-muted-foreground">Chargement…</p>
        )}

        {isError && (
          <p className="py-16 text-center text-destructive">
            Impossible de charger les produits. {errorMessage}
          </p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Aucun produit disponible.
          </p>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <PriceFilter
            products={products}
            onChange={handleFilteredProducts}
          />
        )}

        {!isLoading && !isError && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && filteredProducts.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Aucun produit ne correspond à cette fourchette de prix.
          </p>
        )}

        {pagination && pagination.totalPages > 1 && (
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
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages || isLoading}
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

export default Catalog;
