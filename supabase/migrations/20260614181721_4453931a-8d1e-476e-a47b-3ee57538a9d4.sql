ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS cover_image_caption text,
  ADD COLUMN IF NOT EXISTS cover_image_credit text,
  ADD COLUMN IF NOT EXISTS cover_image_is_ai boolean NOT NULL DEFAULT false;