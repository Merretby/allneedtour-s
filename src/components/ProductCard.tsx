import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  oldPrice?: string;
}

const ProductCard = ({ image, name, price, oldPrice }: ProductCardProps) => {
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover-lift border border-border cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
        />
        <button className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card smooth-transition">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{price}</span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {oldPrice}
            </span>
          )}
        </div>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
