import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminBike } from "@/lib/bikes.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { BikeEditor } from "@/components/admin/BikeEditor";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/mnv/bikes_/$id")({
  component: EditBike,
});

function EditBike() {
  const { id } = Route.useParams();
  const fetchBike = useServerFn(getAdminBike);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bike", id],
    queryFn: () => fetchBike({ data: { id } }),
  });

  return (
    <AdminShell
      title={data?.bike ? `${data.bike.brand} ${data.bike.model}` : "Fahrrad bearbeiten"}
      breadcrumbs={[
        { label: "Admin", to: "/mnv" },
        { label: "Fahrräder", to: "/mnv/bikes" },
        { label: data?.bike?.model ?? "Bearbeiten" },
      ]}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3 bg-zinc-900" />
          <Skeleton className="h-64 w-full bg-zinc-900" />
        </div>
      ) : data?.bike ? (
        <BikeEditor initial={data.bike} />
      ) : (
        <div className="text-zinc-400">Fahrrad nicht gefunden</div>
      )}
    </AdminShell>
  );
}
