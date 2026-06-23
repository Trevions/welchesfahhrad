import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { BikeEditor } from "@/components/admin/BikeEditor";

export const Route = createFileRoute("/_authenticated/mnv/bikes_/new")({
  component: NewBike,
});

function NewBike() {
  return (
    <AdminShell
      title="Neues Fahrrad"
      breadcrumbs={[{ label: "Admin", to: "/mnv" }, { label: "Fahrräder", to: "/mnv/bikes" }, { label: "Neu" }]}
    >
      <BikeEditor />
    </AdminShell>
  );
}
