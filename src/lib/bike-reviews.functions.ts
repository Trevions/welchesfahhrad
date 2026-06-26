import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BikeReview = {
  id: string;
  bike_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  verified_owner: boolean;
  created_at: string;
  display_name?: string | null;
};

function publicClient() {
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
}

export const listBikeReviews = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ bikeId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { data: rows, error } = await sb
      .from("bike_reviews")
      .select("id, bike_id, user_id, rating, title, body, photos, verified_owner, created_at")
      .eq("bike_id", data.bikeId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let names = new Map<string, string | null>();
    if (userIds.length) {
      const { data: profs } = await sb.from("profiles").select("id, display_name").in("id", userIds);
      names = new Map((profs ?? []).map((p: any) => [p.id, p.display_name]));
    }
    const reviews: BikeReview[] = (rows ?? []).map((r: any) => ({
      ...r,
      photos: Array.isArray(r.photos) ? r.photos : [],
      display_name: names.get(r.user_id) ?? null,
    }));
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { reviews, count: reviews.length, average: Math.round(avg * 10) / 10 };
  });

const reviewInput = z.object({
  bikeId: z.string().uuid(),
  rating: z.number().int().min(1).max(10),
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(10).max(4000),
});

export const submitBikeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reviewInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bike_reviews")
      .upsert(
        {
          bike_id: data.bikeId,
          user_id: context.userId,
          rating: data.rating,
          title: data.title,
          body: data.body,
        },
        { onConflict: "bike_id,user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMyBikeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("bike_reviews").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
