import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { LexikonForm } from "@/components/admin/LexikonForm";

export const Route = createFileRoute("/_authenticated/mnv/lexikon_/new")({
  component: NewLexikonTerm,
});

function NewLexikonTerm() {
  return (
    <AdminShell
      title="Neuer Begriff"
      breadcrumbs={[
        { label: "Admin", to: "/mnv" },
        { label: "Lexikon", to: "/mnv/lexikon" },
        { label: "Neu" },
      ]}
    >
      <LexikonForm />
    </AdminShell>
  );
}
