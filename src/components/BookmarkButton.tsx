import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks, type Bookmark as BookmarkType } from "@/hooks/use-bookmarks";

type Props = {
  article: Omit<BookmarkType, "savedAt">;
  variant?: "icon" | "full";
  className?: string;
};

export function BookmarkButton({ article, variant = "icon", className }: Props) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(article.slug);

  const onClick = () => {
    const added = toggle(article);
    if (added) {
      toast.success("Artikel gemerkt", {
        description: "Du findest ihn in deiner Merkliste.",
        action: {
          label: "Ansehen",
          onClick: () => {
            window.location.href = "/merkliste";
          },
        },
      });
    } else {
      toast("Aus Merkliste entfernt");
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={
          "inline-flex items-center gap-2 border border-border px-4 py-2 text-sm transition-colors hover:border-foreground " +
          (saved ? "bg-foreground text-background border-foreground " : "text-foreground ") +
          (className ?? "")
        }
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Gemerkt" : "Merken"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Aus Merkliste entfernen" : "Artikel merken"}
      aria-pressed={saved}
      className={
        "flex h-8 w-8 items-center justify-center border transition-colors " +
        (saved
          ? "bg-foreground text-background border-foreground"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground") +
        " " +
        (className ?? "")
      }
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3 w-3" />}
    </button>
  );
}
