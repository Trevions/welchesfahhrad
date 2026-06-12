import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card pb-28 md:pb-12 pt-16">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-baseline">
              <span className="font-display text-3xl font-black italic">
                Radmap<span className="text-signal">.</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm text-muted-foreground font-light leading-relaxed">
              Das führende deutsche Magazin für Fahrräder, E-Bikes und alles rund
              um den Radsport. Tagesaktuell. Unabhängig. Mit Leidenschaft für jeden Kilometer.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-signal" />
              <span className="eyebrow-sm text-muted-foreground">Issue No. 24 / 2026</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow text-foreground">Rubriken</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li><Link to="/nachrichten" className="text-muted-foreground hover:text-signal transition-colors">Nachrichten</Link></li>
              <li><Link to="/ratgeber" className="text-muted-foreground hover:text-signal transition-colors">Ratgeber</Link></li>
              <li><Link to="/e-bikes" className="text-muted-foreground hover:text-signal transition-colors">E-Bikes</Link></li>
              <li><Link to="/tests" className="text-muted-foreground hover:text-signal transition-colors">Tests</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow text-foreground">Verlag</h4>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li>Über uns</li>
              <li>Redaktion</li>
              <li>Mediadaten</li>
              <li>Kontakt</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="eyebrow text-foreground">Newsletter</h4>
            <p className="mt-5 text-sm text-muted-foreground font-light">
              Die wichtigsten Geschichten der Woche — jeden Freitag in Ihrem Postfach.
            </p>
            <form className="mt-4 flex border border-border bg-background">
              <input
                type="email"
                placeholder="ihre@email.de"
                aria-label="E-Mail Adresse"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-foreground px-4 py-3 eyebrow-sm text-background hover:bg-signal hover:text-signal-foreground transition-colors"
              >
                Abonnieren
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} radmap.de — Alle Rechte vorbehalten.</div>
          <div className="flex gap-6">
            <span className="hover:text-foreground transition-colors cursor-pointer">Impressum</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Datenschutz</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">AGB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
