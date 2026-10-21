import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

const CLOSE_DELAY_MS = 120;

const Navigation = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  const openCategory = (slug: string) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHoveredCategory(slug);
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setHoveredCategory(null),
      CLOSE_DELAY_MS
    );
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const categories = [
    {
      name: "Bons Plans & Cadeaux",
      slug: "bons-plans",
      subcategories: [
        { name: "À -25%", items: [] },
        { name: "Petits prix", items: [] },
        { name: "Coffrets cadeaux", items: [] },
        { name: "Cartes-cadeaux", items: [] },
        { name: "Jeux concours", items: [] },
        { name: "Black Friday", items: [] },
        { name: "Événements spéciaux", items: [] },
      ],
    },
    {
      name: "K-Beauty",
      slug: "k-beauty",
      subcategories: [
        { name: "Sérums coréens", items: [] },
        { name: "Masques tissu", items: [] },
        { name: "Routine coréenne", items: [] },
        { name: "Double nettoyage", items: [] },
        { name: "Essence", items: [] },
        { name: "CICA", items: [] },
        { name: "Marques K-Beauty", items: [] },
      ],
    },
    {
      name: "Skincare",
      slug: "skincare",
      subcategories: [
        { name: "Sérums", items: [] },
        { name: "Crèmes jour/nuit", items: [] },
        { name: "Contour des yeux", items: [] },
        { name: "Masques", items: ["Masques tissu", "Masques crème"] },
        { name: "Nettoyants", items: ["Démaquillants", "Nettoyants visage"] },
        { name: "Soins ciblés", items: ["Anti-âge", "Anti-imperfections", "Hydratation", "Pores", "Rougeurs", "Peaux sensibles"] },
        { name: "Solaire visage", items: ["Protection solaire", "Après-soleil", "Autobronzant"] },
        { name: "Mini/Voyage", items: [] },
        { name: "Par type de peau", items: ["Sèche", "Mixte", "Grasse", "Sensible", "Mature"] },
      ],
    },
    {
      name: "Capillaire",
      slug: "capillaire",
      subcategories: [
        { name: "Shampooing", items: [] },
        { name: "Après-shampooing", items: [] },
        { name: "Masques cheveux", items: [] },
        { name: "Soins sans rinçage", items: [] },
        { name: "Huile cheveux", items: [] },
        { name: "Coloration", items: [] },
        { name: "Shampooing sec", items: [] },
        { name: "Accessoires", items: ["Brosses", "Lisseur", "Boucleur", "Barrettes/Élastiques"] },
        { name: "Parapharmacie", items: ["Anti-chute", "Cuir chevelu", "Volume"] },
        { name: "Par type", items: ["Bouclés/Frisés", "Colorés", "Fins", "Secs/Abîmés", "Normaux"] },
      ],
    },
    {
      name: "Maquillage",
      slug: "maquillage",
      subcategories: [
        { name: "Teint", items: ["Fond de teint", "Correcteur", "Poudres", "BB/CC crème", "Palette teint"] },
        { name: "Yeux", items: ["Palettes yeux", "Mascara", "Eyeliner", "Crayon", "Faux-cils"] },
        { name: "Lèvres", items: ["Rouge à lèvres", "Gloss", "Baume lèvres", "Crayon lèvres"] },
        { name: "Sourcils", items: ["Crayon/Poudre", "Gel/Mascara", "Kit sourcils"] },
        { name: "Ongles", items: ["Vernis", "Accessoires"] },
        { name: "Mini formats", items: [] },
        { name: "Coffrets", items: [] },
        { name: "Clean Beauty", items: [] },
        { name: "Par effet", items: ["Matifiant", "Glow", "Naturel", "Haute pigmentation"] },
      ],
    },
    {
      name: "Parfums",
      slug: "parfums",
      subcategories: [
        { name: "Parfums Femme", items: ["Eau de parfum", "Eau de toilette", "Parfum solide"] },
        { name: "Parfums Homme", items: ["Eau de parfum", "Eau de toilette", "Parfum solide"] },
        { name: "Mixte/Unisexe", items: [] },
        { name: "Miniatures", items: [] },
        { name: "Coffrets", items: [] },
        { name: "Brume parfumée", items: [] },
        { name: "Parfum cheveux", items: [] },
        { name: "Notes olfactives", items: ["Vanillé", "Musqué", "Boisé", "Floral", "Sucré"] },
        { name: "Services", items: ["Gravure personnalisée", "Recyclage/Recharge"] },
      ],
    },
    {
      name: "Santé & Bien-être",
      slug: "sante-bien-etre",
      subcategories: [
        { name: "Dermatologie", items: ["Crèmes", "Peaux sensibles"] },
        { name: "Compléments", items: [] },
        { name: "Hygiène", items: ["Capillaire", "Corps", "Bucco-dentaire"] },
        { name: "Maman & Bébé", items: [] },
        { name: "Solaires", items: [] },
        { name: "Par besoin", items: ["Peaux atopiques", "Anti-rougeurs", "Cicatrisation", "Vergetures"] },
      ],
    },
    {
      name: "Corps & Bain",
      slug: "corps-bain",
      subcategories: [
        { name: "Soins du corps", items: ["Laits", "Crèmes hydratantes", "Huile nourrissante"] },
        { name: "Gommage & Peeling", items: [] },
        { name: "Mains & Pieds", items: [] },
        { name: "Solaire corps", items: ["Protection", "Après-soleil", "Autobronzant"] },
        { name: "Bain & Douche", items: ["Gel douche", "Savon solide", "Huile de bain", "Sel de bain"] },
        { name: "Bien-être", items: ["Dépollution", "Jambes lourdes", "Accessoires"] },
      ],
    },
    {
      name: "Nouveautés & Tendances",
      slug: "nouveautes",
      subcategories: [
        { name: "Nouveautés marques", items: [] },
        { name: "Tendances Instagram", items: [] },
        { name: "Tendances TikTok", items: [] },
        { name: "Testé en vidéo", items: [] },
        { name: "Influenceurs", items: [] },
        { name: "Viral", items: [] },
      ],
    },
    {
      name: "Marques",
      slug: "marques",
      subcategories: [
        { name: "Toutes les marques", items: [] },
        { name: "Uniquement chez nous", items: [] },
        { name: "Par popularité", items: [] },
        { name: "Nouveautés", items: [] },
      ],
    },
  ];

  return (
    <nav
      className="border-b border-border bg-card sticky top-[76px] z-40 overflow-visible"
      onKeyDown={(event) => {
        if (event.key === "Escape") setHoveredCategory(null);
      }}
    >
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex space-x-6 py-4 overflow-x-auto md:overflow-visible">
          {categories.map((category, index) => (
            <div
              key={category.slug}
              className="relative flex-shrink-0"
              onMouseEnter={() => openCategory(category.slug)}
              onMouseLeave={scheduleClose}
              onFocus={() => openCategory(category.slug)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  scheduleClose();
                }
              }}
            >
              <button
                onClick={() => navigate(`/category/${category.slug}`)}
                className="text-sm font-medium text-foreground hover:text-primary smooth-transition flex items-center gap-1 whitespace-nowrap"
              >
                {category.name}
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Dropdown Menu */}
              {hoveredCategory === category.slug && (
                <div
                  className={`absolute top-full z-50 pt-2 ${
                    index >= categories.length - 2 ? "right-0" : "left-0"
                  }`}
                  onMouseEnter={() => openCategory(category.slug)}
                  onMouseLeave={scheduleClose}
                >
                  <div className="bg-white dark:bg-gray-900 border border-border rounded-lg shadow-2xl min-w-[320px] max-w-[700px] p-6">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-h-[500px] overflow-y-auto">
                      {category.subcategories.map((sub, idx) => (
                        <div key={idx} className="group">
                          <h3
                            className="font-semibold text-sm text-foreground mb-2 hover:text-primary cursor-pointer"
                            onClick={() => navigate(`/category/${category.slug}`)}
                          >
                            {sub.name}
                          </h3>
                          {sub.items && sub.items.length > 0 && (
                            <ul className="ml-3 space-y-1.5">
                              {sub.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <button
                                    onClick={() => navigate(`/category/${category.slug}`)}
                                    className="text-xs text-muted-foreground hover:text-primary smooth-transition block text-left"
                                  >
                                    • {item}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
