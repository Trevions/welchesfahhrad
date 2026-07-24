import { auth, defineMcp } from "@lovable.dev/mcp-js";

import { createArticle, deleteArticle, getArticle, listArticles, publishArticle, updateArticle } from "./tools/articles";
import { createBike, deleteBike, getBike, listBikes, publishBike, updateBike } from "./tools/bikes";
import { createLexikonTerm, deleteLexikonTerm, getLexikonTerm, listLexikonTerms, updateLexikonTerm } from "./tools/lexikon";
import { uploadImage } from "./tools/images";
import { analyticsSummary, runReadSql } from "./tools/analytics";
import { listContactMessages, newsletterStatus, whoami } from "./tools/site";

// Direct Supabase host (not the .lovable.cloud proxy) — required for OAuth issuer validation.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "welchesfahrrad-mcp",
  title: "welchesfahrrad.de – Admin MCP",
  version: "0.1.0",
  instructions: [
    "MCP-Server für welchesfahrrad.de (deutsches Fahrrad-Magazin).",
    "Nach Anmeldung als Admin verfügbar: Artikel, Fahrräder, Lexikon-Begriffe",
    "vollständig CRUD verwalten, Bilder in den Storage laden, Analytics abrufen,",
    "Tools katalogisieren und Ad-hoc SELECT-Analysen fahren.",
    "Vor destruktiven Aktionen (delete_*) confirm=true verlangen.",
  ].join(" "),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoami,
    // Articles
    listArticles, getArticle, createArticle, updateArticle, publishArticle, deleteArticle,
    // Bikes
    listBikes, getBike, createBike, updateBike, publishBike, deleteBike,
    // Lexikon
    listLexikonTerms, getLexikonTerm, createLexikonTerm, updateLexikonTerm, deleteLexikonTerm,
    // Media
    uploadImage,
    // Analytics
    analyticsSummary, runReadSql,
    // Site
    listContactMessages, newsletterStatus,
  ],
});
