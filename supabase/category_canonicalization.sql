-- Keep category labels identical to the values rendered and queried by the app.
-- Existing databases may still contain the legacy Fashion / UGC Ads labels.
UPDATE public.categories
SET name = CASE slug
  WHEN 'fashion' THEN 'Fashion & Editorial'
  WHEN 'ugc' THEN 'UGC & TikTok'
  WHEN 'anime' THEN 'Anime & Illustration'
  WHEN 'food' THEN 'Food & Beverage'
  WHEN 'cinematic' THEN 'Cinematic & Film'
  WHEN 'beauty' THEN 'Beauty & Skincare'
  WHEN 'fitness' THEN 'Fitness & Sports'
  WHEN 'travel' THEN 'Travel & Nature'
  WHEN 'luxury' THEN 'Luxury & Jewelry'
  WHEN '3d' THEN '3D & Motion'
  ELSE name
END
WHERE slug IN ('fashion', 'ugc', 'anime', 'food', 'cinematic', 'beauty', 'fitness', 'travel', 'luxury', '3d');
