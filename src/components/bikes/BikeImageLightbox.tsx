import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { articleImageUrl } from "@/lib/article-image-url";

type Props = {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  alt?: string;
};

const MIN = 1;
const MAX = 6;
const STEP = 0.5;

export function BikeImageLightbox({ images, index, onClose, onIndexChange, alt = "" }: Props) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const src = articleImageUrl(images[index]) || images[index];

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  useEffect(() => {
    reset();
  }, [index, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && images.length > 1) onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft" && images.length > 1) onIndexChange((index - 1 + images.length) % images.length);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(MAX, s + STEP));
      if (e.key === "-") setScale((s) => Math.max(MIN, s - STEP));
      if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, images.length, onClose, onIndexChange, reset]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const next = Math.min(MAX, Math.max(MIN, s + (e.deltaY < 0 ? STEP : -STEP)));
      if (next === MIN) {
        setTx(0);
        setTy(0);
      }
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  // Basic pinch-to-zoom via touch events
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      const next = Math.min(MAX, Math.max(MIN, pinchRef.current.scale * (d / pinchRef.current.dist)));
      setScale(next);
      if (next === MIN) {
        setTx(0);
        setTy(0);
      }
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  if (typeof document === "undefined") return null;

  const zoomIn = () => setScale((s) => Math.min(MAX, s + STEP));
  const zoomOut = () =>
    setScale((s) => {
      const n = Math.max(MIN, s - STEP);
      if (n === MIN) {
        setTx(0);
        setTy(0);
      }
      return n;
    });

  const prev = () => onIndexChange((index - 1 + images.length) % images.length);
  const next = () => onIndexChange((index + 1) % images.length);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Bildansicht"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-white/10 text-white">
        <div className="text-[11px] uppercase tracking-wider font-mono opacity-70 tabular-nums">
          {images.length > 1 ? `${index + 1} / ${images.length}` : "Bild"}
          <span className="ml-3 opacity-60">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={zoomOut} label="Verkleinern" disabled={scale <= MIN}>
            <ZoomOut className="h-4 w-4" />
          </IconBtn>
          <IconBtn onClick={zoomIn} label="Vergrößern" disabled={scale >= MAX}>
            <ZoomIn className="h-4 w-4" />
          </IconBtn>
          <IconBtn onClick={reset} label="Zurücksetzen" disabled={scale === 1 && tx === 0 && ty === 0}>
            <RotateCcw className="h-4 w-4" />
          </IconBtn>
          <IconBtn onClick={onClose} label="Schließen">
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative flex-1 overflow-hidden touch-none select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={() => (scale === 1 ? setScale(2.5) : reset())}
        style={{ cursor: scale > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-full max-w-full object-contain will-change-transform"
          style={{
            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
            transition: dragRef.current || pinchRef.current ? "none" : "transform 120ms ease-out",
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Vorheriges Bild"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Nächstes Bild"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="border-t border-white/10 px-2 md:px-4 py-2 overflow-x-auto">
          <div className="flex gap-1.5">
            {images.map((t, i) => {
              const u = articleImageUrl(t) || t;
              const isActive = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden border-2 ${
                    isActive ? "border-signal" : "border-transparent opacity-60 hover:opacity-100"
                  } bg-white/5 flex items-center justify-center p-0.5`}
                >
                  <img src={u} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function IconBtn({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center text-white/90 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
