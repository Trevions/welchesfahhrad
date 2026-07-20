import { Scale, Check } from "lucide-react";
import { toast } from "sonner";
import { useCompare } from "@/hooks/use-compare";

type Props = {
  slug: string;
  variant?: "icon" | "full" | "card";
  className?: string;
};

export function BikeCompareButton({ slug, variant = "icon", className }: Props) {
  const { has, toggle, max } = useCompare();
  const active = has(slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggle(slug);
    if (res.full) {
      toast.error(`Maximal ${max} Räder vergleichbar`);
      return;
    }
    if (res.added) {
      toast.success("Zum Vergleich hinzugefügt", {
        action: { label: "Ansehen", onClick: () => (window.location.href = "/vergleich") },
      });
    } else {
      toast("Aus Vergleich entfernt");
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={
          "inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-bold border transition-colors " +
          (active
            ? "bg-signal text-[#050505] border-signal"
            : "border-border text-foreground hover:border-signal hover:text-signal") +
          " " + (className ?? "")
        }
      >
        {active ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
        {active ? "Im Vergleich" : "Vergleichen"}
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? "Aus Vergleich entfernen" : "Zum Vergleich hinzufügen"}
        aria-pressed={active}
        className={
          "absolute top-2 right-11 z-10 flex h-8 w-8 items-center justify-center backdrop-blur transition-colors " +
          (active
            ? "bg-signal/95 text-[#050505]"
            : "bg-background/85 text-foreground hover:bg-signal hover:text-[#050505]") +
          " " + (className ?? "")
        }
      >
        {active ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Aus Vergleich entfernen" : "Zum Vergleich hinzufügen"}
      aria-pressed={active}
      className={
        "flex h-9 w-9 items-center justify-center border transition-colors " +
        (active
          ? "bg-signal text-[#050505] border-signal"
          : "border-border text-muted-foreground hover:text-signal hover:border-signal") +
        " " + (className ?? "")
      }
    >
      {active ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
    </button>
  );
}
