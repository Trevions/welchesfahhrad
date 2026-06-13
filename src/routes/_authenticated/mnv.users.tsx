import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, setUserRole } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const fetch = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetch(),
  });

  const toggle = async (userId: string, role: "admin" | "editor", grant: boolean) => {
    try {
      await setRole({ data: { userId, role, grant } });
      toast.success("Rolle aktualisiert");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
    }
  };

  const users = data?.users ?? [];

  return (
    <AdminShell
      title="Benutzer & Rollen"
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Benutzer" }]}
    >
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
              <th className="font-medium px-4 py-3">Benutzer</th>
              <th className="font-medium px-4 py-3 hidden md:table-cell">Registriert</th>
              <th className="font-medium px-4 py-3 hidden md:table-cell">Rollen</th>
              <th className="font-medium px-4 py-3 w-28">Editor</th>
              <th className="font-medium px-4 py-3 w-28">Admin</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-zinc-900">
                  <td colSpan={5} className="px-4 py-3"><Skeleton className="h-10 w-full bg-zinc-900" /></td>
                </tr>
              ))
            ) : (
              users.map((u: any) => {
                const isAdmin = u.roles.includes("admin");
                const isEditor = u.roles.includes("editor");
                return (
                  <tr key={u.id} className="border-b border-zinc-900 hover:bg-zinc-900/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FF6A1A] to-amber-500 grid place-items-center text-[10px] font-bold text-zinc-950">
                          {(u.email ?? "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-zinc-100">{u.display_name ?? "—"}</div>
                          <div className="text-xs text-zinc-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 && <span className="text-xs text-zinc-600">—</span>}
                        {u.roles.map((r: string) => (
                          <Badge
                            key={r}
                            variant="outline"
                            className={
                              r === "admin"
                                ? "border-[#FF6A1A] bg-[#FF6A1A]/10 text-[#FF6A1A] text-[10px]"
                                : r === "editor"
                                ? "border-sky-800 bg-sky-950/40 text-sky-400 text-[10px]"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px]"
                            }
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={isEditor} onCheckedChange={(c) => toggle(u.id, "editor", c)} />
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={isAdmin} onCheckedChange={(c) => toggle(u.id, "admin", c)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Nur Admins können diese Seite sehen und Rollen ändern. Der erste registrierte Nutzer ist automatisch Admin.
      </p>
    </AdminShell>
  );
}
