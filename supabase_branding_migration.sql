-- Create a table for global app branding settings
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name TEXT DEFAULT 'Leady',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Single row constraint (only one set of settings for the whole app)
CREATE UNIQUE INDEX IF NOT EXISTS single_app_settings ON public.app_settings ((true));

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read (for branding), but only authenticated users can update
CREATE POLICY "Anyone can view app settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update app settings" ON public.app_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert initial default settings
INSERT INTO public.app_settings (app_name, primary_color)
VALUES ('Leady', '#2563eb')
ON CONFLICT DO NOTHING;
