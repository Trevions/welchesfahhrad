import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AuthGate,
});

function AuthGate() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setAuthed(!!data.user);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!authed) return <SignInPanel />;
  return <Outlet />;
}

function SignInPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Angemeldet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 bg-zinc-950 text-zinc-100 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,106,26,0.18),transparent_60%)]" />
        <div className="relative space-y-6 mt-auto">
          <div className="text-xs uppercase tracking-[0.4em] text-[#FF6A1A]">Redaktion</div>
          <h1 className="font-display text-6xl font-black italic leading-[0.9]">
            Welches Fahrrad. <span className="text-zinc-500">Cockpit.</span>
          </h1>
          <p className="text-zinc-400 max-w-md font-light">
            Verwalten Sie Artikel, Medien und Autoren — alles an einem Ort,
            mit voller redaktioneller Kontrolle.
          </p>
        </div>
        <div className="relative text-xs text-zinc-600 uppercase tracking-[0.3em]">
          welchesfahrrad.de — Ausgabe 2026
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-[#FF6A1A] mb-3">Anmelden</div>
            <h2 className="font-display text-4xl font-black leading-tight">Willkommen zurück.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Melden Sie sich an, um Inhalte zu verwalten.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="redaktion@welchesfahrrad.de" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
