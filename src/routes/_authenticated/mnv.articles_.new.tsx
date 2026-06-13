import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/_authenticated/mnv/articles_/new")({
  component: NewArticle,
});

function NewArticle() {
  return (
    <AdminShell
      title="Neuer Artikel"
      breadcrumbs={[
        { label: "Admin", to: "/mnv" },
        { label: "Artikel", to: "/mnv/articles" },
        { label: "Neu" },
      ]}
    >
      <ArticleEditor />
    </AdminShell>
  );
}
