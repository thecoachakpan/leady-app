-- LEADY UNIFIED BOOTSTRAP SCHEMA (Idempotent Version)
-- Run this script in your Supabase SQL Editor to initialize or reset a project.

-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  profession TEXT,
  industry TEXT,
  income_range TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT 'NGN',
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT DEFAULT 'Leady',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS single_app_settings ON public.app_settings ((true));

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  street_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_terms TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', 
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rate DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup & Recreate Policies
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    
    -- App Settings
    DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
    DROP POLICY IF EXISTS "Admin users can manage app settings" ON public.app_settings;
    DROP POLICY IF EXISTS "Authenticated users can update app settings" ON public.app_settings;
    
    -- Clients
    DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
    DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
    DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
    DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
    
    -- Invoices
    DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
    
    -- Items
    DROP POLICY IF EXISTS "Users can manage items of their own invoices" ON public.invoice_items;
END $$;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin users can manage app settings" ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = profile_id);

CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own invoices" ON public.invoices FOR DELETE USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage items of their own invoices" ON public.invoice_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE public.invoices.id = public.invoice_items.invoice_id 
    AND public.invoices.profile_id = auth.uid()
  )
);

-- 4. Initial Data
INSERT INTO public.app_settings (app_name, primary_color)
VALUES ('Leady', '#2563eb')
ON CONFLICT DO NOTHING;

-- 5. Functions & Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
