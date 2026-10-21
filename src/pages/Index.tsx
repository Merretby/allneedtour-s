import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import SeasonalBanner from "@/components/SeasonalBanner";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import { Star } from "lucide-react";
import { Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBlackFriday, useProducts } from "@/lib/api/hooks";
import { formatPrice, resolveImageUrl, toNumber } from "@/lib/format";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bestsellers");
  const [showProducts, setShowProducts] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const { data, isLoading } = useProducts({ limit: 12 });
  const { data: blackFriday } = useBlackFriday();
  const recommendedProducts = data?.data ?? [];
  const deals = recommendedProducts.filter(
    (product) => toNumber(product.compare_at_price) > toNumber(product.price)
  );
  const activeProducts =
    activeTab === "bestsellers"
      ? recommendedProducts.slice(0, 4)
      : (deals.length > 0 ? deals : recommendedProducts).slice(0, 4);

  const brands = [
    { name: "MAKEUP BY MARIO", category: "Maquillage" },
    { name: "MAKE UP FOR EVER", category: "Maquillage" },
    { name: "Huda Beauty", category: "Maquillage" },
    { name: "BYS Cosmetics", category: "Maquillage" },
    { name: "Charlotte Tilbury", category: "Maquillage" },
    { name: "Fenty Beauty", category: "Maquillage" },
    { name: "e.l.f. Cosmetics", category: "Maquillage" },
    { name: "Too Faced", category: "Maquillage" },
    { name: "tarte", category: "Maquillage" },
    { name: "Benefit Cosmetics", category: "Maquillage" },
    { name: "Rare Beauty", category: "Maquillage" },
    { name: "PASTEL", category: "Maquillage" },
    { name: "NARS", category: "Maquillage" },
    { name: "NYX Professional Makeup", category: "Maquillage" },
    { name: "The Ordinary", category: "Soins" },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      comment:
        "Livraison rapide et produits de qualité ! Je recommande vivement.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Amina K.",
      rating: 5,
      comment: "Le meilleur site pour les produits K-Beauty au Maroc !",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Leila B.",
      rating: 5,
      comment: "Service client au top, emballage soigné. Parfait !",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />
      <HeroCarousel />

      {/* Black Friday Section */}
      {blackFriday?.active && (blackFriday.products?.length ?? 0) > 0 && (
        <section className="border-y border-destructive/20 bg-destructive/5 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-1 text-sm font-semibold text-destructive-foreground">
                <Tag className="h-4 w-4" />
                Black Friday
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-heading font-bold text-foreground">
                Offres Black Friday
              </h2>
              <p className="text-muted-foreground">
                Une sélection à prix réduit, pendant la campagne uniquement
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {blackFriday.products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  promoLabel="Black Friday"
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button
                onClick={() => navigate("/black-friday")}
                className="rounded-full"
              >
                Voir toutes les offres →
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recommendations Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Nos recommandations beauté
          </h2>
          <p className="text-muted-foreground">
            Une sélection personnalisée pour vous
          </p>
        </div>
        <ProductCarousel products={recommendedProducts} />
        {isLoading && (
          <p className="text-center text-muted-foreground mt-4">Chargement des produits…</p>
        )}
      </section>

      {/* Best-sellers & Deals Section */}
      <section className="bg-secondary relative">
        <div className="container mx-auto px-4">
          <div 
            className="flex flex-col items-center justify-center transition-all duration-500 ease-out"
            style={{
              minHeight: '300px',
              maxHeight: showProducts ? '2000px' : '300px',
              paddingTop: showProducts ? '80px' : '0',
              paddingBottom: showProducts ? '80px' : '0',
            }}
          >
            {/* Tabs Container */}
            <div 
              className="flex gap-24 transition-all duration-500 ease-out"
              style={{
                marginTop: showProducts ? '0' : '80px',
                marginBottom: showProducts ? '32px' : '16px',
              }}
            >
              <button
                onClick={() => setActiveTab("bestsellers")}
                onMouseEnter={() => setShowProducts(true)}
                onMouseLeave={() => setShowProducts(false)}
                className={`px-10 py-4 text-xl font-semibold rounded-xl transition-all duration-300 shadow-md ${
                  activeTab === "bestsellers" 
                    ? "bg-primary text-primary-foreground scale-105" 
                    : "bg-card text-foreground hover:shadow-lg"
                }`}
              >
                Best-sellers
              </button>
              
              <button
                onClick={() => setActiveTab("deals")}
                onMouseEnter={() => setShowProducts(true)}
                onMouseLeave={() => setShowProducts(false)}
                className={`px-10 py-4 text-xl font-semibold rounded-xl transition-all duration-300 shadow-md ${
                  activeTab === "deals" 
                    ? "bg-primary text-primary-foreground scale-105" 
                    : "bg-card text-foreground hover:shadow-lg"
                }`}
              >
                Bonnes affaires
              </button>
            </div>
            
            {/* Voir plus button when not hovering */}
            <div 
              className="transition-opacity duration-300"
              style={{
                opacity: showProducts ? 0 : 1,
                height: showProducts ? 0 : 'auto',
                overflow: 'hidden'
              }}
            >
              <Button variant="link" className="text-primary text-lg">
                Voir plus →
              </Button>
            </div>

            {/* Products Container */}
            <div 
              className="w-full transition-all duration-500 ease-out"
              onMouseEnter={() => setShowProducts(true)}
              onMouseLeave={() => setShowProducts(false)}
              style={{
                maxHeight: showProducts ? '2000px' : '0',
                opacity: showProducts ? 1 : 0,
                overflow: showProducts ? 'visible' : 'hidden',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                {/* Show 3 products */}
                {activeProducts.slice(0, 3).map((product) => (
                  <a key={product.id} href={`/product/${product.id}`} className="hover-lift">
                    <div className="aspect-square bg-secondary rounded-xl mb-3 overflow-hidden">
                      <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="font-semibold text-primary">{formatPrice(product.price)}</p>
                    {toNumber(product.compare_at_price) > toNumber(product.price) && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.compare_at_price)}
                      </p>
                    )}
                  </a>
                ))}

                {/* 4th card with "Savoir plus" */}
                <div
                  onClick={() => navigate(activeTab === "bestsellers" ? "/category/nouveautes" : "/category/bons-plans")}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer hover-lift"
                >
                  <div className="absolute inset-0">
                    <img
                      src={resolveImageUrl(activeProducts[3]?.image_url ?? activeProducts[0]?.image_url)}
                      alt="Voir plus"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-all duration-300"></div>
                  </div>
                  <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">
                      {activeTab === "bestsellers" ? "Découvrir tous nos Best-sellers" : "Voir toutes nos Bonnes affaires"}
                    </h3>
                    <Button 
                      size="lg"
                      className="bg-white text-foreground hover:bg-white/90 rounded-full font-semibold"
                    >
                      Savoir plus →
                    </Button>
                  </div>
                </div>
              </div>
              
              {showProducts && (
                <div className="flex justify-center mt-8">
                  <Button variant="link" className="text-primary text-lg">
                    Voir plus →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Essentials */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Indispensables de la saison
          </h2>
          <p className="text-muted-foreground">
            Les must-have pour votre routine beauté
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SeasonalBanner title="Collection Été" bgColor="bg-wellness" />
          <SeasonalBanner title="Hydratation Intense" bgColor="bg-primary" />
          <SeasonalBanner title="Hiver Cocooning" bgColor="bg-accent" />
          <SeasonalBanner title="Protection Solaire" bgColor="bg-secondary" />
        </div>
      </section>

      {/* Brands Section */}
      <section className="bg-secondary py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center">
              Nos marques
            </h2>
          </div>
          
          {/* Scrolling Marquee */}
          <div className="relative">
            <style>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .animate-scroll {
                animation: scroll 40s linear infinite;
              }
              .animate-scroll:hover {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="flex gap-6 animate-scroll">
              {/* First set of brands */}
              {brands.map((brand, index) => (
                <div
                  key={`brand-1-${index}`}
                  className="flex-shrink-0 hover:scale-110 transition-transform duration-300 min-w-[200px]"
                >
                  <span className="font-bold text-foreground text-lg">
                    {brand.name}
                  </span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {brands.map((brand, index) => (
                <div
                  key={`brand-2-${index}`}
                  className="flex-shrink-0 hover:scale-110 transition-transform duration-300 min-w-[200px]"
                >
                  <span className="font-bold text-foreground text-lg">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Program */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-primary rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90"></div>
          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="h-full min-h-[400px] flex items-center justify-center p-12">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-foreground/10 rounded-full blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80" 
                  alt="Loyalty Program" 
                  className="relative w-full h-full object-cover max-w-sm rounded-3xl drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-primary-foreground text-sm font-semibold">✨ Exclusif</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6 leading-tight">
                Programme de fidélité Para La Grand
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 leading-relaxed">
                Profitez d'avantages exclusifs, de réductions personnalisées et
                de cadeaux surprise à chaque commande.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-card text-foreground hover:bg-card/90 hover:scale-105 transition-all duration-300 rounded-full px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Savoir plus →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center">
              Avis clients
            </h2>
          </div>
          
          {/* Single testimonial card with auto-scroll */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`
                }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0"
                  >
                    <div className="bg-gradient-to-br from-card to-card/50 rounded-3xl p-12 mx-4 shadow-2xl backdrop-blur-sm border border-border/50">
                      <div className="flex flex-col items-center">
                        {/* Photo */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                          <img 
                            src={testimonial.photo}
                            alt={testimonial.name}
                            className="relative w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-xl"
                          />
                        </div>
                        
                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-primary text-primary"
                            />
                          ))}
                        </div>
                        
                        {/* Comment */}
                        <p className="text-foreground text-xl mb-6 text-center leading-relaxed max-w-2xl">
                          "{testimonial.comment}"
                        </p>
                        
                        {/* Name */}
                        <p className="text-lg font-bold text-foreground">
                          {testimonial.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Add Comment Button */}
            <div className="flex justify-center mt-8">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-all duration-300"
                onClick={() => {
                  toast({
                    title: "Connexion requise",
                    description: "Veuillez vous inscrire ou vous connecter pour laisser un avis.",
                    duration: 5000,
                  });
                }}
              >
                Ajouter un avis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* See Also */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-12 text-center">
          Voir aussi
        </h2>
        
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* K-beauty Column */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">K-beauty</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes solaires coréennes</button></li>
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Sérum coréen à la vitamine C</button></li>
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Sérums pour les cils</button></li>
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes solaires naturelles</button></li>
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes hydratantes pour peaux sèches</button></li>
                <li><button onClick={() => navigate("/category/k-beauty")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Maquillage Igari</button></li>
              </ul>
            </div>

            {/* J-beauty Column */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">J-beauty</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Masques coréens</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Sérum Niacinamide</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Acide hyaluronique</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Meilleures crèmes solaires pour le visage</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Sérums pour peaux sèches</button></li>
              </ul>
            </div>

            {/* Maquillage chinois Column */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">Maquillage chinois</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/category/maquillage")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes hydratantes visage</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Sérum à la vitamine C</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes solaires minérales</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Lotions toniques pour peaux grasses</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Nettoyants visage pour peaux sèches</button></li>
              </ul>
            </div>

            {/* Soin du visage Column */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">Soin du visage</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">BB crèmes</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Acide bêta-hydroxylé</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes hydratantes avec SPF</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes hydratantes pour peaux grasses</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes hydratantes pour peaux sensibles</button></li>
              </ul>
            </div>

            {/* Maquillage coréen Column */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">Maquillage coréen</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/category/maquillage")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Rouges à lèvres</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Soins aux probiotiques</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Crèmes solaires teintées</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Nettoyants visage pour peaux grasses</button></li>
                <li><button onClick={() => navigate("/category/skincare")} className="text-muted-foreground hover:text-primary transition-colors text-sm text-left">Nettoyants visage pour peaux sensibles</button></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
