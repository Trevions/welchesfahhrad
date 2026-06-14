import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionLayer } from "@/components/MotionLayer";
import { CookieConsentBanner } from "@/components/CookieConsent";
import { InstallAppBanner } from "@/components/InstallAppBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="eyebrow text-signal">Fehler 404</div>
        <h1 className="mt-4 font-display text-7xl font-black italic leading-none">
          Nicht <span className="text-muted-foreground">gefunden.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 border border-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all hover:bg-foreground hover:text-background"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="eyebrow text-signal">Fehler</div>
        <h1 className="mt-4 font-display text-4xl font-black">Etwas ist schiefgelaufen.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border border-foreground bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-background"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest"
          >
            Startseite
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#050505" },
      { name: "application-name", content: "RADMAP" },
      { name: "apple-mobile-web-app-title", content: "RADMAP" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "radmap.de – Fahrrad-News, Tests & Ratgeber" },
      {
        name: "description",
        content:
          "Tagesaktuelle Nachrichten, Tests, Ratgeber und Kaufberatung rund um Fahrräder, E-Bikes und Radsport in Deutschland. Unabhängig und kompetent.",
      },
      { name: "author", content: "radmap.de" },
      { name: "google-site-verification", content: "_6gLgomav_z_dTAtMUX9TdQzBXEmmx_IiEx_lW1vvoM" },
      { property: "og:site_name", content: "radmap.de" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "radmap.de – Fahrrad-News, Tests & Ratgeber" },
      { name: "twitter:title", content: "radmap.de – Fahrrad-News, Tests & Ratgeber" },
      { name: "description", content: "Aktuelle News, ehrliche Tests, Kaufberatung und Praxis-Tipps rund ums Rad und E-Bike. Täglich neu, immer unabhängig." },
      { property: "og:description", content: "Aktuelle News, ehrliche Tests, Kaufberatung und Praxis-Tipps rund ums Rad und E-Bike. Täglich neu, immer unabhängig." },
      { name: "twitter:description", content: "Aktuelle News, ehrliche Tests, Kaufberatung und Praxis-Tipps rund ums Rad und E-Bike. Täglich neu, immer unabhängig." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/DQfUar8YcyQZOSMZV6R2J2trAoX2/social-images/social-1781289587892-ChatGPT_Image_12.06.2026_г.,_21_39_33.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/DQfUar8YcyQZOSMZV6R2J2trAoX2/social-images/social-1781289587892-ChatGPT_Image_12.06.2026_г.,_21_39_33.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,700;1,900&family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen">
          <MotionLayer />
          <Header />
          <MobileHeader />
          <main className="pb-24 md:pb-0">
            <Outlet />
          </main>
          <Footer />
          <MobileNav />
          <CookieConsentBanner />
          <InstallAppBanner />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
