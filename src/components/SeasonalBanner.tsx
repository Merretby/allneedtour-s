import { Button } from "@/components/ui/button";

interface SeasonalBannerProps {
  title: string;
  bgColor: string;
}

const SeasonalBanner = ({ title, bgColor }: SeasonalBannerProps) => {
  return (
    <div
      className={`${bgColor} rounded-2xl p-8 md:p-12 text-center hover-lift h-[280px] flex flex-col items-center justify-center`}
    >
      <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
        {title}
      </h3>
      <Button variant="outline" className="rounded-full">
        Voir tous
      </Button>
    </div>
  );
};

export default SeasonalBanner;
