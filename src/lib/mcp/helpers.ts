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

export async function requireAdmin(ctx: ToolContext) {
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !userId) {
    return { error: "Nicht angemeldet." as const };
  }
  const sb = supabaseForUser(ctx);
  const { data, error } = await sb.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return { error: `Rollencheck fehlgeschlagen: ${error.message}` };
  if (!data) return { error: "Zugriff verweigert: Admin-Rolle erforderlich." };
  return { sb, userId };
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
