import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const topicEnum = z.enum(["redaktion", "presse", "werbung", "sonstiges"]);
const statusEnum = z.enum(["new", "read", "archived"]);

const submitInput = z.object({
  topic: topicEnum,
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(5).max(5000),
  consent: z.literal(true),
  // honeypot — must be empty
  website: z.string().max(0).optional().default(""),
});

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: admin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (admin) return "admin" as const;
  const { data: editor } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "editor",
  });
  if (editor) return "editor" as const;
  throw new Error("Forbidden: staff access required");
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => submitInput.parse(data))
  .handler(async ({ data }) => {
    // Honeypot — silently succeed if filled
    if (data.website && data.website.length > 0) {
      return { ok: true };
    }

    const ua = getRequestHeader("user-agent") ?? null;
    const fwd = getRequestHeader("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || null;

    let ipHash: string | null = null;
    if (ip) {
      const enc = new TextEncoder().encode(ip + "|welchesfahrrad");
      const buf = await crypto.subtle.digest("SHA-256", enc);
      ipHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      topic: data.topic,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      user_agent: ua,
      ip_hash: ipHash,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listContactMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        status: statusEnum.optional(),
        search: z.string().max(200).optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase
      .from("contact_messages")
      .select("id, topic, name, email, subject, message, status, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (data?.status) q = q.eq("status", data.status);
    if (data?.search) q = q.or(
      `subject.ilike.%${data.search}%,name.ilike.%${data.search}%,email.ilike.%${data.search}%`,
    );
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);

    const { count: unread } = await context.supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    return { messages: rows ?? [], unread: unread ?? 0 };
  });

export const getUnreadContactCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { count } = await context.supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    return { unread: count ?? 0 };
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: statusEnum,
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const role = await assertStaff(context);
    if (role !== "admin") throw new Error("Forbidden: admins only");
    const { error } = await context.supabase
      .from("contact_messages")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
