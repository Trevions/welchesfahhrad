import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

export function supabaseForUser(ctx: ToolContext): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

type AdminOk = { ok: true; sb: ReturnType<typeof supabaseForUser>; userId: string };
type AdminErr = { ok: false; error: string };
export type AdminGate = AdminOk | AdminErr;

export async function requireAdmin(ctx: ToolContext): Promise<AdminGate> {
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !userId) {
    return { ok: false, error: "Nicht angemeldet." };
  }
  const sb = supabaseForUser(ctx);
  const { data, error } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) return { ok: false, error: `Rollencheck fehlgeschlagen: ${error.message}` };
  if (!data) return { ok: false, error: "Zugriff verweigert: Admin-Rolle erforderlich." };
  return { ok: true, sb, userId };
}

export function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError: isError || undefined };
}

export function jsonResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value as Record<string, unknown>,
  };
}
