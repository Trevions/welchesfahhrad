import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useBikeFavorites, type BikeFavorite } from "@/hooks/use-bike-favorites";

type Props = {
  bike: Omit<BikeFavorite, "savedAt">;
  variant?: "icon" | "full" | "card";
  className?: string;
};

export function BikeFavoriteButton({ bike, variant = "icon", className }: Props) {
  const { isFavorite, toggle } = useBikeFavorites();
  const saved = isFavorite(bike.slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(bike);
    if (added) {
      toast.success("Zu Favoriten hinzugefügt", {
        description: `${bike.brand} ${bike.model} ist in deinen Favoriten.`,
        action: {
          label: "Ansehen",
          onClick: () => {
            window.location.href = "/favoriten";
          },
        },
      });
    } else {
      toast("Aus Favoriten entfernt");
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={
          "inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-bold border transition-colors " +
          (saved
            ? "bg-signal text-[#050505] border-signal"
            : "border-border text-foreground hover:border-signal hover:text-signal") +
          " " +
          (className ?? "")
        }
      >
        <Heart className={"h-3.5 w-3.5 " + (saved ? "fill-current" : "")} />
        {saved ? "Favorit" : "Favorit speichern"}
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={saved ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        aria-pressed={saved}
        className={
          "absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center backdrop-blur transition-colors " +
          (saved
            ? "bg-signal/95 text-[#050505]"
            : "bg-background/85 text-foreground hover:bg-signal hover:text-[#050505]") +
          " " +
          (className ?? "")
        }
      >
        <Heart className={"h-4 w-4 " + (saved ? "fill-current" : "")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      aria-pressed={saved}
      className={
        "flex h-9 w-9 items-center justify-center border transition-colors " +
        (saved
          ? "bg-signal text-[#050505] border-signal"
          : "border-border text-muted-foreground hover:text-signal hover:border-signal") +
        " " +
        (className ?? "")
      }
    >
      <Heart className={"h-4 w-4 " + (saved ? "fill-current" : "")} />
    </button>
  );
}
