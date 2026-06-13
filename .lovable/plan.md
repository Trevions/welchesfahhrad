## Problem

Aktualnata avtomatizatsiya dava na AI samo **titul + 1-2 izrechenie rezyume** ot Perplexity. AI nyama realniya tekst na statiyata, zatova:
- izmislya fakti, taktiki, prognozi
- ponyakoga pishe za savsem druga novina (zarazhda se ot drugi citati)
- raztyaga na 600+ dumi obshti frazi

Za 100% tochnost trqbva: **da se vzeme tselia tekst ot iztochnika**, da se podade na AI s strogi pravila "samo fakti ot tekstа", i da se validira che generiranoto ne sadarzha izmisleni imena/fakti.

## Plan

### 1. Scrape pаlnata statiya ot URL (Firecrawl)
- Dobavyam Firecrawl connector (veche e dostapen kato standard connector).
- V `auto-article.server.ts` nov `fetchSourceArticle(url)` koyto vika Firecrawl `scrape` s `formats: ['markdown']`, `onlyMainContent: true`.
- Ako scrape se provali ili vrate <300 dumi tekst → **skip** iztochnika (status `failed`, reason "source too short / scrape failed"). Bez statiya.

### 2. Strogi pravila za AI rewrite (samo fakti ot iztochnika)
Promenyam `rewriteArticle` da prashta na AI **tselia scrape-nat markdown** + sledniya nov system prompt:

- "Pishi SAMO fakti, koito sashtestvuvat v iztochnika. Nikakvi prognozi, nikakvi taktichesi analizi, nikakvi 'mozhe da', 'oshte poveche', 'pozitiven signal'."
- Zabraneni shabloni: prognozi za badeshti sastezaniya, emotsionalni komentari, generichni sportni frazi.
- Dalzhina: **350–550 dumi** (ne 600–900). Predpochita se po-kratko i fakto-bazirano pred dalgo.
- Vseki spomenat chovek/otbor/myasto/data **trqbva** da prisestva v iztochnika.
- Sahranyavame i `key_facts: string[]` (5–10 fakta kopirani/perifrasirani direktno ot iztochnika) — za validatsiya.

Smyana na modela na **`google/gemini-2.5-pro`** za tova zadanie (po-malko halyutsinatsii ot flash).

### 3. Validatsiya sled generaciya (anti-hallucination)
Nov `validateAgainstSource(rewritten, sourceText)`:
- Izvlicha sobstveni imena (kapitalizirani dumi/frazi: hora, otbori, mesta) ot generiraniya `title + body`.
- Za vsyako ime proverqva dali sashtestvuva v `sourceText` (normalizirano, bez interpunktsiya).
- Ako >2 imena lipsvat → **otkazva statiyata**, zapisva v `article_sources.status='failed'` s reason "hallucinated entities: X, Y, Z". Ne se publikuva.
- Sashto: ako `key_facts` ne se namirat v iztochnika → fail.

### 4. Razshiryavane na otkrivaneto (edna tema ot mnogo mesta) — optional, bez razdavane
Polzvame Perplexity `sonar` s `return_related_questions=false` i pitame go da dade **5 razlichni iztochnika za sashtata tema**. Sled tova izbirame **edin osnoven** (nay-dalgiya scrape) — ne kombiniraме nyakolko statii v edna (tova samо zahranva halyutsinatsii). Ostаnаlite URL-ove se zapisvat v `article_sources` kato `related_sources` (JSON kolona).

### 5. UI v `/mnv/auto-articles`
- Pokazva za vsyaka neuspyala statiya tochnata prichina (`skip_reason`): "scrape failed", "source too short", "hallucinated entities: ...", "validation failed".
- Buton "Pokazhi izvlecheniya iztochnik" — da se vizhda kakvo e bilo podadeno na AI.

## Technical Details

**Files to change**
- `src/lib/auto-article.server.ts` — `fetchSourceArticle` (Firecrawl), nov system prompt, `validateAgainstSource`, smyana na model na gemini-2.5-pro, max 550 dumi, schema +`key_facts`.
- `supabase/migrations/...` — dobavq kolona `article_sources.scraped_text TEXT`, `article_sources.related_sources JSONB`, razshiryava `status` enum-vrednosti ("scrape_failed", "hallucination_detected", "source_too_short").
- `src/routes/_authenticated/mnv.auto-articles.tsx` — pokazva noviya skip_reason + scraped preview.

**Connectors / secrets**
- Trqbva da svarzha **Firecrawl connector** (ne sashtestvuva v tekushtite secrets). Posle ne se iska rachna namesa.

**Modeli (Lovable AI Gateway, bez dop. kluch)**
- Tekst: `google/gemini-2.5-pro` (za rewrite — po-tochen).
- Snimki: ostava `google/gemini-2.5-flash-image` (Nano Banana).

## What this fixes

- Tochnost: AI vizhda tselia tekst, ne edno izrechenie → ne moze da "izmisli" druga novina.
- Zashto Maxim van Gils se yavyava: zashtoto Perplexity e vаrnal nyakolko candidates i AI e generiral "obshta" e-bike/cycling statiya ot title. S Firecrawl + validatsiya, takav drift se otkazva avtomatichno.
- Halyutsinatsii: hard-block chrez entity validation.
- Dalzhina: smaleno na 350–550 dumi.

## Pitam predi da realiziram

1. **Firecrawl connector** — da go svarzha li sega (preporachvam DA, bez nego "scrape pаlnata statiya" e nevazmozhno)?
2. Ako Firecrawl scrape se provali za daden iztochnik — **propusni tihо** ili **opitay v.v. iztochnik** (drug URL ot sashtata tema)?
