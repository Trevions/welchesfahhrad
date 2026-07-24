import { useEffect, useRef, useState, type ReactNode } from "react";
import { Share2, Link as LinkIcon, Check, Mail, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  url: string; // absolute or path
  title: string;
  text?: string;
  image?: string;
  className?: string;
};

const SITE = "https://welchesfahrrad.de";

function absolute(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return SITE + (url.startsWith("/") ? url : "/" + url);
}

export function ShareMenu({ url, title, text, image, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const shareUrl = absolute(url);
  const shareText = text ?? title;
  const enc = encodeURIComponent;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onNative = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text: shareText, url: shareUrl });
        return true;
      } catch {
        // user cancelled — fall through to menu
      }
    }
    return false;
  };

  const handleClick = async () => {
    const ok = await onNative();
    if (!ok) setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link kopiert");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const targets: { label: string; href: string; brand: string; icon: ReactNode }[] = [
    {
      label: "Facebook",
      brand: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.8.22-1.35 1.38-1.35H16.4V5.54c-.26-.04-1.14-.11-2.17-.11-2.15 0-3.62 1.31-3.62 3.72v2.05H8.2V14h2.41v7h2.89z" />
        </svg>
      ),
    },
    {
      label: "X (Twitter)",
      brand: "#000",
      href: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareText)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M17.53 3H20.5l-6.5 7.43L21.75 21h-6.04l-4.73-6.18L5.57 21H2.6l6.96-7.95L2.25 3h6.2l4.28 5.66L17.53 3zm-1.06 16h1.67L7.6 4.9H5.82L16.47 19z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      brand: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.75h4V21H3V9.75zM9 9.75h3.8v1.54h.05c.53-.94 1.83-1.94 3.77-1.94 4.03 0 4.78 2.4 4.78 5.51V21h-4v-4.93c0-1.18-.02-2.7-1.65-2.7-1.66 0-1.91 1.29-1.91 2.62V21H9V9.75z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      brand: "#25D366",
      href: `https://api.whatsapp.com/send?text=${enc(shareText + " " + shareUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.5 3.5A10.5 10.5 0 0 0 3.6 16.2L2 22l5.9-1.55A10.5 10.5 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.07-1.11l-.29-.17-3.5.92.93-3.41-.19-.3A8 8 0 1 1 12 20zm4.5-5.66c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.95c-.14.16-.28.18-.52.06s-1.02-.38-1.94-1.2c-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.55.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      brand: "#229ED9",
      href: `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M9.78 15.27 9.6 18.6c.27 0 .39-.12.53-.26l1.27-1.21 2.64 1.94c.48.27.83.13.96-.45l1.74-8.17.01-.01c.16-.73-.26-1.02-.74-.84L5.6 13.07c-.71.28-.7.68-.12.86l2.69.84 6.25-3.94c.29-.18.56-.08.34.1l-5.06 4.34z" />
        </svg>
      ),
    },
    {
      label: "Reddit",
      brand: "#FF4500",
      href: `https://www.reddit.com/submit?url=${enc(shareUrl)}&title=${enc(title)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M22 12.07c0-1.16-.95-2.1-2.12-2.1-.56 0-1.07.22-1.45.58-1.43-1-3.37-1.64-5.51-1.72l.94-4.41 3.08.66c.03.78.67 1.4 1.46 1.4.81 0 1.46-.65 1.46-1.45 0-.8-.65-1.45-1.46-1.45-.57 0-1.07.33-1.31.81L13.6 3.6c-.18-.04-.36.08-.4.26l-1.05 4.91c-2.17.07-4.13.7-5.58 1.71-.38-.36-.89-.58-1.45-.58A2.13 2.13 0 0 0 3 12.07c0 .82.47 1.53 1.16 1.87-.04.24-.06.48-.06.73 0 2.97 3.55 5.38 7.92 5.38 4.37 0 7.92-2.41 7.92-5.38 0-.24-.02-.48-.06-.71.66-.35 1.12-1.04 1.12-1.86zM7.5 13.62c0-.8.65-1.45 1.45-1.45.81 0 1.46.65 1.46 1.45 0 .8-.65 1.45-1.46 1.45-.8 0-1.45-.65-1.45-1.45zm7.95 3.46c-.96.96-2.8 1.04-3.34 1.04-.55 0-2.39-.08-3.35-1.04a.36.36 0 0 1 0-.51.36.36 0 0 1 .51 0c.61.61 1.91.82 2.84.82.93 0 2.23-.21 2.84-.82a.36.36 0 0 1 .51 0 .36.36 0 0 1-.01.51zm-.39-2c-.8 0-1.45-.65-1.45-1.45 0-.8.65-1.45 1.45-1.45.81 0 1.46.65 1.46 1.45 0 .8-.65 1.45-1.46 1.45z" />
        </svg>
      ),
    },
    {
      label: "E-Mail",
      brand: "currentColor",
      href: `mailto:?subject=${enc(title)}&body=${enc(shareText + "\n\n" + shareUrl)}`,
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  return (
    <div ref={ref} className={"relative " + (className ?? "")}>
      <button
        type="button"
        aria-label="Teilen"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleClick}
        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        <Share2 className="h-3 w-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-50 w-72 bg-background border border-border shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="eyebrow-sm text-muted-foreground">Artikel teilen</div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-2">
            {targets.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-sm"
                onClick={() => setOpen(false)}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-white"
                  style={{ background: t.brand }}
                >
                  {t.icon}
                </span>
                <span className="text-foreground">{t.label}</span>
              </a>
            ))}

            <button
              type="button"
              onClick={copy}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-foreground">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <LinkIcon className="h-4 w-4" />}
              </span>
              <span className="text-foreground">{copied ? "Kopiert!" : "Link kopieren"}</span>
            </button>
          </div>

          {image && (
            <div className="px-4 py-3 border-t border-border flex items-center gap-3">
              <img src={image} alt="" className="h-10 w-14 object-cover" />
              <div className="text-xs text-muted-foreground line-clamp-2">{title}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
