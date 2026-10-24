import { Instagram, Facebook, Youtube, ShoppingBag, Truck, CreditCard, RotateCcw, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const topBannerItems = [
    {
      icon: ShoppingBag,
      title: "Retrait en magasin",
      subtitle: "Click & Collect en 2h offert",
      link: "En savoir plus"
    },
    {
      icon: Truck,
      title: "Livraison standard offerte",
      subtitle: "à domicile dès 60 Dhs partout au Maroc",
      link: "Explorer l'offre"
    },
    {
      icon: CreditCard,
      title: "Paiements sécurisés",
      subtitle: "et paiements en plusieurs fois",
      link: "En savoir plus"
    },
    {
      icon: RotateCcw,
      title: "Retours",
      subtitle: "sous 14 jours",
      link: "Retourner mon article"
    }
  ];

  const footerSections = [
    {
      title: "Aide",
      links: [
        { label: "FAQ", path: "/contact" },
        { label: "Moyens de paiement acceptés", path: "/contact" },
        { label: "Nous contacter", path: "/contact" },
        { label: "Conditions de livraison", path: "/contact" },
        { label: "Retourner un produit", path: "/orders" },
        { label: "*Conditions de nos offres", path: "/category/bons-plans" },
        { label: "*Exclusion des promotions", path: "/category/bons-plans" }
      ],
    },
    {
      title: "Mon Compte",
      links: [
        { label: "Mon compte", path: "/profile" },
        { label: "Programme de fidélité", path: "/auth" },
        { label: "Authenticité des avis", path: "/" },
        { label: "Préférence cookies", path: "/" }
      ],
    },
    {
      title: "A propos de Para La Grand",
      links: [
        { label: "Qui sommes-nous ?", path: "/contact" },
        { label: "Carrières", path: "/contact" },
        { label: "Nos engagements", path: "/contact" },
        { label: "Découvrir Para La Grand", path: "/" },
        { label: "Nos boutiques", path: "/contact" },
        { label: "Magasins", path: "/contact" }
      ],
    },
    {
      title: "Actualités",
      links: [
        { label: "Idées cadeaux", path: "/category/bons-plans" },
        { label: "Cartes cadeaux", path: "/category/bons-plans" },
        { label: "Gravure parfum", path: "/category/parfums" },
        { label: "Black Friday", path: "/black-friday" },
        { label: "Single day", path: "/category/bons-plans" },
        { label: "Calendrier de l'avent", path: "/category/bons-plans" },
        { label: "Clean Beauty", path: "/category/skincare" },
        { label: "Idées & Inspirations Beauté", path: "/" },
        { label: "Nouveautés", path: "/category/nouveautes" }
      ],
    },
  ];

  return (
    <footer className="site-footer bg-background border-t border-border mt-20">
      {/* Top Banner Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topBannerItems.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <item.icon className="h-8 w-8 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.subtitle}
                  </p>
                  <a
                    href="#"
                    className="text-xs text-foreground underline hover:no-underline smooth-transition"
                  >
                    {item.link}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4 text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => navigate(link.path)}
                        className="text-sm text-gray-300 hover:text-white smooth-transition text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Social Media & App Download Section */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Nous suivre</h3>
              <div className="flex gap-3 mb-8">
                <a
                  href="#"
                  className="text-white hover:text-gray-300 smooth-transition"
                  aria-label="Youtube"
                >
                  <Youtube className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 smooth-transition"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 smooth-transition"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 smooth-transition"
                  aria-label="Snapchat"
                >
                  <Smartphone className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 smooth-transition"
                  aria-label="TikTok"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>

              <h3 className="font-semibold mb-4 text-white">Télécharger l'App Para La Grand</h3>
              <div className="space-y-2">
                <a href="#" className="block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-10 w-auto"
                  />
                </a>
                <a href="#" className="block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="Download on the App Store"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Legal Links */}
          <div className="pt-8 border-t border-gray-800">
            <div className="text-xs text-gray-400 space-y-4">
              <p>
                Marques exclues de nos promotions{" "}
                <button onClick={() => navigate("/category/bons-plans")} className="underline hover:text-white">ici</button>.<br />
                *Voir conditions de nos offres sur{" "}
                <button onClick={() => navigate("/category/bons-plans")} className="underline hover:text-white">Bons Plans Beauté</button>.<br />
                *Produits authentiques garantis. Livraison dans tout le Maroc.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <button onClick={() => navigate("/contact")} className="hover:text-white">Mentions légales et CGU</button>
                <span>|</span>
                <button onClick={() => navigate("/contact")} className="hover:text-white">Conditions générales de vente</button>
                <span>|</span>
                <button onClick={() => navigate("/contact")} className="hover:text-white">Données personnelles et cookies</button>
                <span>|</span>
                <button onClick={() => navigate("/contact")} className="hover:text-white">Cosmétovigilance et Nutrivigilance</button>
                <span>|</span>
                <button onClick={() => navigate("/auth")} className="hover:text-white">Conditions Générales du programme de fidélité</button>
                <span>|</span>
                <button onClick={() => navigate("/")} className="hover:text-white">Conditions de publication des avis</button>
                <span>|</span>
                <button onClick={() => navigate("/")} className="hover:text-white">Accessibilité : non conforme</button>
                <span>|</span>
                <button onClick={() => navigate("/contact")} className="hover:text-white">Qualités et caractéristiques environnementales</button>
                <span>|</span>
                <button onClick={() => navigate("/")} className="hover:text-white">Sitemap</button>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <img src="https://flagcdn.com/w20/ma.png" alt="Maroc" className="h-4 w-auto" />
                <span className="text-white">Maroc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
