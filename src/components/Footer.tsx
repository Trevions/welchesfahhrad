import { Link } from "@tanstack/react-router";
import { Bike } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/50 pb-28 md:pb-12 pt-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <Bike className="h-6 w-6 text-signal" />
              <span className="font-display text-lg font-bold">
                radmap<span className="text-signal">.</span>de
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Das führende deutsche Magazin für Fahrräder, E-Bikes und alles rund
              um den Radsport. Tagesaktuell. Unabhängig. Mit Leidenschaft.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Rubriken</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/nachrichten" className="hover:text-foreground">Nachrichten</Link></li>
              <li><Link to="/ratgeber" className="hover:text-foreground">Ratgeber</Link></li>
              <li><Link to="/e-bikes" className="hover:text-foreground">E-Bikes</Link></li>
              <li><Link to="/tests" className="hover:text-foreground">Tests</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Unternehmen</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Über uns</li>
              <li>Kontakt</li>
              <li>Impressum</li>
              <li>Datenschutz</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} radmap.de — Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
