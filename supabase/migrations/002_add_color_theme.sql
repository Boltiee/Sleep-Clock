-- Migration: Add color_theme column to settings table
-- This supports the new color theme preset feature

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS color_theme TEXT NOT NULL DEFAULT 'custom';

-- Add comment for documentation
COMMENT ON COLUMN settings.color_theme IS 'Color theme preset name: watercolor, pastel, sunset, forest, ocean, rainbow, monochrome, or custom';
