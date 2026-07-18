import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, requireAdmin, textResult } from "../helpers";

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("avif")) return "avif";
  if (m.includes("gif")) return "gif";
  if (m.includes("svg")) return "svg";
  return "jpg";
}

export const uploadImage = defineTool({
  name: "upload_image",
  title: "Bild hochladen",
  description:
    "Lädt ein Bild in den Storage-Bucket 'article-images' und liefert eine öffentliche URL (radmap.de/api/public/article-image/…). Als data-URL (base64) oder Remote-URL.",
  inputSchema: {
    data_url: z.string().optional().describe("data:image/…;base64,… oder https-URL zum Herunterladen"),
    filename: z.string().optional().describe("Optionaler Dateiname (ohne Pfad)."),
    folder: z.string().optional().default("mcp").describe("Unterordner im Bucket, z. B. 'articles/2026'."),
    content_type: z.string().optional().describe("Nur nötig, wenn nicht aus data-URL / Response ableitbar."),
  },
  handler: async (input, ctx) => {
    const gate = await requireAdmin(ctx);
    if (!gate.ok) return textResult(gate.error, true);
    if (!input.data_url) return textResult("data_url erforderlich.", true);

    let bytes: Uint8Array;
    let mime = input.content_type ?? "image/jpeg";

    if (input.data_url.startsWith("data:")) {
      const m = /^data:([^;,]+)(?:;base64)?,(.*)$/s.exec(input.data_url);
      if (!m) return textResult("Ungültige data-URL.", true);
      mime = input.content_type ?? m[1];
      const b64 = m[2];
      const bin = atob(b64);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } else if (/^https?:\/\//i.test(input.data_url)) {
      const res = await fetch(input.data_url);
      if (!res.ok) return textResult(`Download fehlgeschlagen: ${res.status}`, true);
      mime = input.content_type ?? res.headers.get("content-type") ?? "image/jpeg";
      bytes = new Uint8Array(await res.arrayBuffer());
    } else {
      return textResult("data_url muss data:… oder https://… sein.", true);
    }

    const ext = extFromMime(mime);
    const safeName = (input.filename ?? `img-${Date.now()}`).replace(/[^\w.\-]/g, "_").replace(/\.[^.]+$/, "");
    const folder = (input.folder ?? "mcp").replace(/^\/+|\/+$/g, "");
    const path = `${folder}/${safeName}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("article-images").upload(path, bytes, {
      contentType: mime,
      upsert: false,
    });
    if (error) return textResult(`Upload fehlgeschlagen: ${error.message}`, true);

    const publicUrl = `https://radmap.de/api/public/article-image/${path}`;
    return jsonResult({ ok: true, path, url: publicUrl, content_type: mime, bytes: bytes.length });
  },
});
