-- Fix known broken Unsplash URLs that return 404 and break image rendering in mobile.
-- Safe to run multiple times.

SET @broken_audio_image := 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05';
SET @fixed_audio_product_image := 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80';
SET @fixed_audio_category_image := 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80';

UPDATE product_images
SET url = @fixed_audio_product_image
WHERE url = @broken_audio_image;

UPDATE categories
SET image_url = @fixed_audio_category_image
WHERE image_url = @broken_audio_image;
