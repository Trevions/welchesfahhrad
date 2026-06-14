import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * 2027 motion layer:
 *  - Top scroll progress bar
 *  - Cursor spotlight (desktop, respects prefers-reduced-motion)
 *  - IntersectionObserver reveals for [data-reveal] and .kinetic
 *  - Magnetic effect for [data-magnetic]
 *  - Auto-splits .kinetic text into chars
 */
export function MotionLayer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Scroll progress
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.setProperty("--scroll", pct + "%");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- Spotlight (desktop pointer only)
    const isFine = window.matchMedia("(pointer: fine)").matches;
    let spot: HTMLDivElement | null = null;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onEnter: (() => void) | null = null;
    let onLeave: (() => void) | null = null;
    if (isFine && !reduce) {
      spot = document.createElement("div");
      spot.className = "spotlight";
      document.body.appendChild(spot);
      onMove = (e: PointerEvent) => {
        spot!.style.setProperty("--mx", e.clientX + "px");
        spot!.style.setProperty("--my", e.clientY + "px");
      };
      onEnter = () => spot!.classList.add("is-active");
      onLeave = () => spot!.classList.remove("is-active");
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerenter", onEnter);
      window.addEventListener("pointerleave", onLeave);
      spot.classList.add("is-active");
    }

    // ---- Split .kinetic into chars (once)
    const splitTargets = document.querySelectorAll<HTMLElement>(".kinetic:not([data-split])");
    splitTargets.forEach((el) => {
      const text = el.textContent ?? "";
      el.setAttribute("data-split", "1");
      el.setAttribute("aria-label", text);
      el.textContent = "";
      let i = 0;
      for (const word of text.split(/(\s+)/)) {
        if (/^\s+$/.test(word)) {
          el.appendChild(document.createTextNode(word));
          continue;
        }
        const wrap = document.createElement("span");
        wrap.style.display = "inline-block";
        wrap.style.whiteSpace = "nowrap";
        for (const ch of Array.from(word)) {
          const s = document.createElement("span");
          s.className = "char";
          s.style.setProperty("--i", String(i++));
          s.textContent = ch;
          wrap.appendChild(s);
        }
        el.appendChild(wrap);
      }
    });

    // ---- Reveal observer (deferred so freshly-mounted routes have layout
    //      computed; also force-reveal anything already in viewport to
    //      avoid missed intersections after back/forward navigation).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    const attachReveals = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const revealEls = document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not(.is-visible), .kinetic:not(.is-visible)",
      );
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) {
          el.classList.add("is-visible");
          return;
        }
        io.observe(el);
      });
    };
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(attachReveals);
    });

    // ---- Magnetic
    const magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const magnetHandlers: Array<() => void> = [];
    if (isFine && !reduce) {
      magnets.forEach((el) => {
        const strength = parseFloat(el.dataset.magnetic || "") || 0.35;
        const mv = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        };
        const reset = () => {
          el.style.transform = "translate(0,0)";
        };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerleave", reset);
        magnetHandlers.push(() => {
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerleave", reset);
        });
      });
    }

    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("scroll", onScroll);
      bar.remove();
      if (spot) {
        if (onMove) window.removeEventListener("pointermove", onMove);
        if (onEnter) window.removeEventListener("pointerenter", onEnter);
        if (onLeave) window.removeEventListener("pointerleave", onLeave);
        spot.remove();
      }
      io.disconnect();
      magnetHandlers.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
