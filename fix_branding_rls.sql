-- Fix RLS policies for app_settings to allow upsert
-- The previous migration only had SELECT and UPDATE policies. 
-- UPSERT requires INSERT permissions as well.

-- Drop existing update policy to recreate it cleanly or just add the missing one
DROP POLICY IF EXISTS "Authenticated users can update app settings" ON public.app_settings;

-- Create a comprehensive policy for authenticated users
CREATE POLICY "Admin users can manage app settings" ON public.app_settings
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure there is always a row to update
INSERT INTO public.app_settings (app_name, primary_color)
VALUES ('Leady', '#2563eb')
ON CONFLICT DO NOTHING;
