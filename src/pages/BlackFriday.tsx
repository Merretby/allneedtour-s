import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useBlackFriday } from "@/lib/api/hooks";
import { formatDate } from "@/lib/format";

const BlackFriday = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBlackFriday();

  const active = Boolean(data?.active);
  const products = data?.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-1 text-sm font-semibold text-destructive-foreground">
            <Tag className="h-4 w-4" />
            Black Friday
          </div>
          <h1 className="mt-4 text-3xl font-heading font-bold text-foreground md:text-4xl">
            Offres Black Friday
          </h1>
          {active && (data?.starts_at || data?.ends_at) && (
            <p className="mt-2 text-muted-foreground">
              {data?.starts_at ? `Du ${formatDate(data.starts_at)}` : ""}
              {data?.ends_at ? ` au ${formatDate(data.ends_at)}` : ""}
            </p>
          )}
        </div>

        {isLoading && (
          <p className="py-16 text-center text-muted-foreground">Chargement…</p>
        )}

        {!isLoading && (isError || !active) && (
          <div className="py-16 text-center">
            <p className="mb-6 text-muted-foreground">
              La campagne Black Friday n'est pas active pour le moment.
            </p>
            <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
          </div>
        )}

        {!isLoading && active && products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Aucun produit dans la campagne Black Friday pour le moment.
          </p>
        )}

        {!isLoading && active && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} promoLabel="Black Friday" />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlackFriday;
