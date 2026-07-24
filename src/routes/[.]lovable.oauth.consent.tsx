import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AuthzDetails = {
  client?: { name?: string; logo_uri?: string; client_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthzDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: ({ search }) => {
    if (!search.authorization_id) throw redirect({ to: "/" });
  },
  component: ConsentPage,
});

function ConsentPage() {
  const { authorization_id } = Route.useSearch();
  const [session, setSession] = useState<null | { user: { id: string; email?: string | null } }>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [details, setDetails] = useState<AuthzDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { user: { id: data.session.user.id, email: data.session.user.email ?? null } } : null);
      setChecking(false);
    });
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ? { user: { id: s.user.id, email: s.user.email ?? null } } : null);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data, error }) => {
      setIsAdmin(!error && data === true);
    });
  }, [session]);


  useEffect(() => {
    if (!session || !authorization_id) return;
    setLoadingDetails(true);
    oauth()
      .getAuthorizationDetails(authorization_id)
      .then(({ data, error }) => {
        if (error) { setLoadError(error.message); return; }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) { window.location.href = immediate; return; }
        setDetails(data);
      })
      .finally(() => setLoadingDetails(false));
  }, [session, authorization_id]);

  async function decide(approve: boolean) {
    if (approve && !isAdmin) {
      setDecisionError("Nur Admins dürfen MCP-Zugriff gewähren.");
      return;
    }
    setBusy(true);
    setDecisionError(null);
    const api = oauth();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setDecisionError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setDecisionError("Keine Weiterleitung erhalten."); return; }
    window.location.href = target;
  }


  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!session) return <SignIn />;

  const clientName = details?.client?.name ?? "Externer Client";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-[#FF6A1A]">MCP-Zugriff</div>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight">
            {clientName} verbinden?
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {clientName} möchte auf welchesfahrrad.de zugreifen und in deinem Namen handeln
            (Artikel & Fahrräder verwalten, Bilder laden, Analysen abrufen).
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Angemeldet als <span className="text-zinc-300">{session.user.email}</span>.
          </p>
        </div>

        {loadingDetails && <div className="text-sm text-zinc-500">Lade Anfrage…</div>}
        {loadError && <div className="text-sm text-rose-400">{loadError}</div>}
        {decisionError && <div role="alert" className="text-sm text-rose-400">{decisionError}</div>}

        {isAdmin === false && (
          <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-sm text-rose-200">
            Dein Konto hat keine Admin-Rolle. Nur Admins dürfen externe MCP-Clients
            mit welchesfahrrad.de verbinden. Bitte kontaktiere einen Administrator.
          </div>
        )}
        {isAdmin === null && session && (
          <div className="text-xs text-zinc-500">Prüfe Admin-Berechtigung…</div>
        )}

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-[#FF6A1A] text-black hover:bg-[#ff7f38] disabled:opacity-40"
            disabled={busy || !!loadError || !details || isAdmin !== true}
            onClick={() => decide(true)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zugriff erlauben"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Ablehnen
          </Button>
        </div>


        <p className="text-[11px] text-zinc-600">
          Aktionen werden mit deinen Admin-Rechten ausgeführt. Du kannst den Zugriff
          jederzeit in deinem Konto widerrufen.
        </p>
      </div>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const returnUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + returnUrl,
    });
    if (result.error) {
      toast.error("Google-Anmeldung fehlgeschlagen");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-[#FF6A1A]">MCP-Zugriff</div>
          <h1 className="mt-2 font-display text-2xl font-black">Zum Fortfahren anmelden</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Nur Admins können externe MCP-Clients autorisieren.
          </p>
        </div>

        <Button variant="outline" className="w-full h-11 border-zinc-700" onClick={onGoogle} disabled={loading}>
          Mit Google fortfahren
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800" /></div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
            <span className="bg-zinc-900 px-2 text-zinc-500">oder</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs text-zinc-400">E-Mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-950 border-zinc-800" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pw" className="text-xs text-zinc-400">Passwort</Label>
            <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-950 border-zinc-800" />
          </div>
          <Button type="submit" className="w-full bg-[#FF6A1A] text-black hover:bg-[#ff7f38]" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  );
}
