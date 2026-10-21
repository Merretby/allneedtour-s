import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlackFriday } from "@/lib/api/hooks";

const BASE_SLIDES = [
  {
    id: 1,
    title: "Black Friday",
    subtitle: "Jusqu'à -50% sur une sélection",
    cta: "Découvrir",
    bgColor: "bg-accent",
    path: "/black-friday",
    campaignOnly: true,
  },
  {
    id: 2,
    title: "Nouveautés K-Beauty",
    subtitle: "Les dernières tendances de Corée",
    cta: "Shop Now",
    bgColor: "bg-primary",
    path: "/category/k-beauty",
    campaignOnly: false,
  },
  {
    id: 3,
    title: "Skincare d'hiver",
    subtitle: "Protégez votre peau du froid",
    cta: "Voir la collection",
    bgColor: "bg-wellness",
    path: "/category/skincare",
    campaignOnly: false,
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const { data: campaign } = useBlackFriday();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(
    () => BASE_SLIDES.filter((slide) => !slide.campaignOnly || campaign?.active),
    [campaign?.active]
  );

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[300px] md:h-[350px] overflow-hidden z-0">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          } ${slide.bgColor}`}
        >
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-center space-y-6 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-foreground/80">
                {slide.subtitle}
              </p>
              <Button
                size="lg"
                onClick={() => navigate(slide.path)}
                className="bg-card text-foreground hover:bg-card/90 rounded-full px-8"
              >
                {slide.cta}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card smooth-transition z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card smooth-transition z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full smooth-transition ${
              index === currentSlide ? "bg-foreground w-6" : "bg-foreground/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
