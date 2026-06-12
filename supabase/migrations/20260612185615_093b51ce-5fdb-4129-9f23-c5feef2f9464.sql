
CREATE POLICY "Public read article-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'article-images');
CREATE POLICY "Staff upload article-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'article-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
CREATE POLICY "Staff update article-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'article-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
CREATE POLICY "Staff delete article-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'article-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
