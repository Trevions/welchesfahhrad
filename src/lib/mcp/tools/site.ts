import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

export const listContactMessages = defineTool({
  name: "list_contact_messages",
  title: "Kontaktnachrichten auflisten",
  description: "Letzte Kontaktnachrichten (radmap.de/kontakt).",
  inputSchema: { limit: z.number().int().min(1).max(100).optional().default(30) },
  annotations: { readOnlyHint: true },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const { data, error } = await gate.sb
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 30);
    if (error) return textResult(error.message, true);
    return jsonResult({ messages: data });
  },
});

export const newsletterStatus = defineTool({
  name: "newsletter_status",
  title: "Newsletter-Status",
  description: "Anzahl Abonnenten und letzte Ausgaben.",
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async (_input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    const [subs, issues] = await Promise.all([
      gate.sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      gate.sb.from("newsletter_issues").select("id, subject, status, scheduled_for, sent_at").order("created_at", { ascending: false }).limit(10),
    ]);
    return jsonResult({ subscriber_count: subs.count ?? 0, recent_issues: issues.data ?? [] });
  },
});

export const whoami = defineTool({
  name: "whoami",
  title: "Angemeldeter Nutzer",
  description: "Zeigt den angemeldeten Nutzer, E-Mail und Admin-Status.",
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Nicht angemeldet.", true);
    return jsonResult({
      user_id: ctx.getUserId(),
      email: ctx.getUserEmail?.() ?? null,
      client_id: ctx.getClientId?.() ?? null,
    });
  },
});
