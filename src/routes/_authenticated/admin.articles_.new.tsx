import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/_authenticated/admin/articles_/new")({
  component: NewArticle,
});

function NewArticle() {
  return (
    <AdminShell
      title="Neuer Artikel"
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Artikel", to: "/admin/articles" },
        { label: "Neu" },
      ]}
    >
      <ArticleEditor />
    </AdminShell>
  );
}
