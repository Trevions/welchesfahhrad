import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
  Search as SearchIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccess } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/mnv", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { to: "/mnv/articles", label: "Artikel", icon: FileText },
  { to: "/mnv/media", label: "Medien", icon: ImageIcon },
  { to: "/mnv/users", label: "Benutzer", icon: Users },
];

export function AdminShell({
  children,
  title,
  breadcrumbs,
  actions,
}: {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const fetchAccess = useServerFn(getMyAccess);
  const { data: access, isLoading } = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => fetchAccess(),
  });

  useEffect(() => {
    if (!isLoading && access && !access.isAdmin && !access.isEditor) {
      toast.error("Kein Zugriff auf den Admin-Bereich");
      navigate({ to: "/" });
    }
  }, [access, isLoading, navigate]);

  useEffect(() => setOpen(false), [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/mnv", replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform lg:translate-x-0 lg:static",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-900">
          <Link to="/mnv" className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-black italic">
              Radmap<span className="text-[#FF6A1A]">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-zinc-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-0.5">
          {NAV.map((item) => {
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  isActive
                    ? "bg-zinc-900 text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#FF6A1A] rounded-r" />
                )}
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-900 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FF6A1A] to-amber-500 grid place-items-center text-xs font-bold text-zinc-950">
              {(access?.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-300 truncate">{access?.email ?? "—"}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                {access?.isAdmin ? "Admin" : access?.isEditor ? "Editor" : "—"}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 -ml-1"
          >
            <LogOut className="h-4 w-4 mr-2" /> Abmelden
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden text-zinc-400">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
                {breadcrumbs.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-zinc-700">/</span>}
                    {b.to ? (
                      <Link to={b.to} className="hover:text-zinc-300 transition">{b.label}</Link>
                    ) : (
                      <span>{b.label}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-base font-semibold text-zinc-100 truncate">{title}</h1>
          </div>
          {actions}
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
