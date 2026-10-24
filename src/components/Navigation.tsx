import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { useBlackFriday } from "@/lib/api/hooks";

const Navigation = () => {
  const navigate = useNavigate();
  const { data: blackFriday } = useBlackFriday();

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
      name: "Hygiène & Bébé",
      slug: "hygiene-bebe",
      subcategories: [
        { name: "Hygiène visage", items: ["Démaquillants et nettoyants"] },
        { name: "Hygiène bucco-dentaire", items: ["Dentifrices", "Brosses à dents"] },
        { name: "Hygiène intime", items: [] },
        { name: "Bébé", items: ["Changes bébé", "Biberons", "Sucettes"] },
      ],
    },
    {
      name: "Santé & Nutrition",
      slug: "sante-nutrition",
      subcategories: [
        { name: "Compléments alimentaires", items: ["Vitamines et formes"] },
        { name: "Énergie et immunité", items: ["Énergie et hydratation", "Défenses immunitaires"] },
        { name: "Digestion et sommeil", items: ["Transit digestion et élimination", "Sommeil et détente"] },
        { name: "Huiles essentielles", items: [] },
      ],
    },
    {
      name: "Sport & Fitness",
      slug: "sport-fitness",
      subcategories: [
        { name: "Protéines", items: ["Compléments sportifs"] },
        { name: "Nutrition sportive", items: ["Barres & encas sportifs"] },
        { name: "Énergie & hydratation", items: [] },
        { name: "Récupération", items: [] },
      ],
    },
    {
      name: "Bio & Maison",
      slug: "bio-maison",
      subcategories: [
        { name: "Cosmétiques bio", items: ["Produits bio visage et corps"] },
        { name: "Hygiène bio", items: ["Produits hygiène bio"] },
        { name: "Alimentation bio", items: ["Alimentation bio et naturel"] },
        { name: "Maison", items: ["Hygiène maison", "Entretien de la maison"] },
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
      data-site-sidebar
      className="site-sidebar border-b border-border bg-card md:border-b-0 md:border-r"
    >
      <div>
        <div className="flex gap-2 overflow-x-auto p-3 md:block md:space-y-1 md:overflow-visible md:p-4">
          {blackFriday?.active && (
            <button
              onClick={() => navigate("/black-friday")}
              className="inline-flex w-auto flex-shrink-0 items-center gap-2 rounded-lg bg-destructive px-3 py-2 text-left text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 md:w-full"
            >
              <Tag className="h-4 w-4" />
              Black Friday
            </button>
          )}
          <button
            onClick={() => navigate("/products")}
            className="inline-flex w-auto flex-shrink-0 items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary md:w-full"
          >
            Tous les produits
          </button>
          {categories.map((category) => (
            <div key={category.slug} className="min-w-[190px] md:min-w-0">
              <button
                onClick={() => navigate(`/category/${category.slug}`)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
              >
                {category.name}
              </button>
              <div className="ml-3 hidden space-y-1 border-l border-border pl-3 md:block">
                {category.subcategories.map((sub) => (
                  <div key={sub.name}>
                    <button
                      onClick={() =>
                        navigate(
                          `/category/${category.slug}?category=${encodeURIComponent(
                            sub.name.toUpperCase()
                          )}`
                        )
                      }
                      className="block w-full rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      {sub.name}
                    </button>
                    {sub.items.map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          navigate(
                            `/category/${category.slug}?category=${encodeURIComponent(
                              item.toUpperCase()
                            )}`
                          )
                        }
                        className="ml-2 block w-[calc(100%-0.5rem)] rounded px-2 py-1 text-left text-[11px] text-muted-foreground hover:text-primary"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
