import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const statusEnum = z.enum(["draft", "published"]);

const termInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen, Bindestriche"),
  term: z.string().min(1).max(200),
  short_definition: z.string().min(1).max(600),
  body: z.string().min(1),
  category: z.string().min(1).max(80),
  status: statusEnum,
  synonyms: z.array(z.string().min(1).max(120)).max(50).default([]),
  related_article_slugs: z.array(z.string().min(1).max(200)).max(50).default([]),
  related_term_slugs: z.array(z.string().min(1).max(200)).max(50).default([]),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(320).nullable().optional(),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden: admin only");
}

export const listLexikonTermsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        search: z.string().optional(),
        status: statusEnum.optional(),
        category: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("lexikon_terms")
      .select(
        "id, slug, term, short_definition, category, status, synonyms, updated_at, created_at",
      )
      .order("updated_at", { ascending: false });
    if (data?.search) q = q.ilike("term", `%${data.search}%`);
    if (data?.status) q = q.eq("status", data.status);
    if (data?.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);
    return { terms: rows ?? [] };
  });

export const getLexikonTermAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("lexikon_terms")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { term: row };
  });

export const upsertLexikonTerm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(termInput)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload: Record<string, any> = {
      slug: data.slug,
      term: data.term,
      short_definition: data.short_definition,
      body: data.body,
      category: data.category,
      status: data.status,
      synonyms: data.synonyms,
      related_article_slugs: data.related_article_slugs,
      related_term_slugs: data.related_term_slugs,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
    };

    const query = data.id
      ? context.supabase
          .from("lexikon_terms")
          .update(payload as never)
          .eq("id", data.id)
          .select("id, slug")
          .single()
      : context.supabase
          .from("lexikon_terms")
          .insert(payload as never)
          .select("id, slug")
          .single();

    const { data: row, error } = await query;
    if (error) throw new Error(error.message);
    return { id: row.id as string, slug: row.slug as string };
  });

export const deleteLexikonTerm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("lexikon_terms").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Options helper for the form (article + term pickers)
export const getLexikonFormOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [{ data: articles }, { data: terms }] = await Promise.all([
      context.supabase
        .from("articles")
        .select("slug, title, category")
        .eq("status", "published")
        .order("title", { ascending: true })
        .limit(1000),
      context.supabase
        .from("lexikon_terms")
        .select("slug, term, category")
        .eq("status", "published")
        .order("term", { ascending: true })
        .limit(1000),
    ]);
    return {
      articles: (articles ?? []) as Array<{ slug: string; title: string; category: string }>,
      terms: (terms ?? []) as Array<{ slug: string; term: string; category: string }>,
    };
  });
