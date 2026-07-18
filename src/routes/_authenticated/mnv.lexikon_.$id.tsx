import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLexikonTermAdmin } from "@/lib/lexikon-admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { LexikonForm, type LexikonFormValues } from "@/components/admin/LexikonForm";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/mnv/lexikon_/$id")({
  component: EditLexikonTerm,
});

function EditLexikonTerm() {
  const { id } = Route.useParams();
  const fetch = useServerFn(getLexikonTermAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-lexikon-term", id],
    queryFn: () => fetch({ data: { id } }),
  });

  const term = data?.term;
  const initial: Partial<LexikonFormValues> | undefined = term
    ? {
        id: term.id,
        slug: term.slug,
        term: term.term,
        short_definition: term.short_definition,
        body: term.body,
        category: term.category,
        status: term.status,
        synonyms: term.synonyms ?? [],
        related_article_slugs: term.related_article_slugs ?? [],
        related_term_slugs: term.related_term_slugs ?? [],
        seo_title: term.seo_title ?? "",
        seo_description: term.seo_description ?? "",
      }
    : undefined;

  return (
    <AdminShell
      title={term?.term ?? "Begriff bearbeiten"}
      breadcrumbs={[
        { label: "Admin", to: "/mnv" },
        { label: "Lexikon", to: "/mnv/lexikon" },
        { label: term?.term ?? "Bearbeiten" },
      ]}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-zinc-900" />
          <Skeleton className="h-64 w-full bg-zinc-900" />
        </div>
      ) : error ? (
        <div className="text-sm text-rose-400">
          {error instanceof Error ? error.message : "Fehler beim Laden"}
        </div>
      ) : term ? (
        <LexikonForm key={term.id} initial={initial} />
      ) : (
        <div className="text-sm text-zinc-500">Nicht gefunden.</div>
      )}
    </AdminShell>
  );
}
