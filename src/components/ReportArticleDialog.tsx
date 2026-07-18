import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitArticleReport } from "@/lib/article-reports.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const REASONS = [
  "Faktenfehler",
  "Veraltete Information",
  "Rechtschreib-/Grammatikfehler",
  "Irreführender Titel",
  "Urheberrecht/Quelle",
  "Anstößiger Inhalt",
  "Sonstiges",
];

export function ReportArticleDialog({
  articleSlug,
  articleTitle,
}: {
  articleSlug: string;
  articleTitle: string;
}) {
  const submit = useServerFn(submitArticleReport);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  const reset = () => {
    setName("");
    setEmail("");
    setReason(REASONS[0]);
    setDescription("");
    setConsent(false);
    setWebsite("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Bitte bestätige die Datenschutzhinweise.");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Bitte beschreibe kurz, was nicht stimmt (mind. 5 Zeichen).");
      return;
    }
    setLoading(true);
    try {
      await submit({
        data: {
          article_slug: articleSlug,
          article_title: articleTitle,
          reporter_name: name,
          reporter_email: email,
          reason,
          description,
          consent: true,
          website,
        },
      });
      toast.success("Danke! Deine Meldung ist bei uns eingegangen.");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Meldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-signal transition-colors"
          aria-label="Artikel melden"
        >
          <Flag className="h-3 w-3" />
          Artikel melden
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Artikel melden</DialogTitle>
          <DialogDescription>
            Etwas stimmt nicht mit diesem Artikel? Sag uns Bescheid — die Redaktion prüft
            jede Meldung persönlich.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* honeypot */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rep-name">Name</Label>
              <Input
                id="rep-name"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-email">E-Mail</Label>
              <Input
                id="rep-email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.de"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rep-reason">Grund</Label>
            <select
              id="rep-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rep-desc">Was ist nicht in Ordnung?</Label>
            <Textarea
              id="rep-desc"
              required
              minLength={5}
              maxLength={5000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bitte beschreibe möglichst konkret, was falsch, irreführend oder problematisch ist — gerne mit Zitat oder Absatz-Hinweis."
            />
            <div className="text-[11px] text-muted-foreground text-right tabular-nums">
              {description.length}/5000
            </div>
          </div>

          <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
              required
            />
            <span>
              Ich willige ein, dass meine Angaben (Name, E-Mail, Nachricht) zur
              Bearbeitung meiner Meldung sowie zur Kontaktaufnahme durch die
              Redaktion gespeichert und verarbeitet werden. Die Einwilligung kann
              ich jederzeit widerrufen. Weitere Informationen in der{" "}
              <a
                href="/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal hover:underline"
              >
                Datenschutzerklärung
              </a>
              .
            </span>
          </label>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !consent}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet…
                </>
              ) : (
                "Meldung senden"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
