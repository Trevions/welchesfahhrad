import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getArticle } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/articles_/$id")({
  component: EditArticle,
});

function EditArticle() {
  const { id } = Route.useParams();
  const fetchOne = useServerFn(getArticle);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => fetchOne({ data: { id } }),
  });

  const a = data?.article;

  return (
    <AdminShell
      title={a?.title ?? "Artikel bearbeiten"}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Artikel", to: "/admin/articles" },
        { label: a?.title ?? "…" },
      ]}
    >
      {isLoading || !a ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full bg-zinc-900" />
          <Skeleton className="h-96 w-full bg-zinc-900" />
        </div>
      ) : (
        <ArticleEditor
          initial={{
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt ?? "",
            body: a.body ?? "",
            cover_image: a.cover_image ?? "",
            category: a.category,
            source: a.source ?? "",
            status: a.status,
            read_time: a.read_time ?? "",
            seo_title: a.seo_title ?? "",
            seo_description: a.seo_description ?? "",
            seo_keywords: a.seo_keywords ?? "",
            og_image: a.og_image ?? "",
          }}
        />
      )}
    </AdminShell>
  );
}
