-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed TEXT,
  date_of_birth DATE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feeding', 'walking', 'grooming', 'medical', 'medication', 'other')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  quantity NUMERIC,
  quantity_unit TEXT,
  duration_mins INTEGER,
  caregiver TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID NOT NULL REFERENCES public.logs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES public.logs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rule TEXT NOT NULL CHECK (rule IN ('none', 'daily', 'weekly', 'custom')),
  repeat_cron TEXT,
  next_run TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = owner_id);

-- Logs policies
CREATE POLICY "Users can view logs for their pets"
  ON public.logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = logs.pet_id
    AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create logs for their pets"
  ON public.logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = logs.pet_id
    AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update logs for their pets"
  ON public.logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = logs.pet_id
    AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete logs for their pets"
  ON public.logs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = logs.pet_id
    AND pets.owner_id = auth.uid()
  ));

-- Attachments policies
CREATE POLICY "Users can view attachments for their logs"
  ON public.attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.logs
    JOIN public.pets ON pets.id = logs.pet_id
    WHERE logs.id = attachments.log_id
    AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create attachments for their logs"
  ON public.attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.logs
    JOIN public.pets ON pets.id = logs.pet_id
    WHERE logs.id = attachments.log_id
    AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete attachments for their logs"
  ON public.attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.logs
    JOIN public.pets ON pets.id = logs.pet_id
    WHERE logs.id = attachments.log_id
    AND pets.owner_id = auth.uid()
  ));

-- Reminders policies
CREATE POLICY "Users can view their own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = owner_id);

-- Create storage buckets for pet photos and attachments
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pet-photos', 'pet-photos', true),
  ('log-attachments', 'log-attachments', true);

-- Storage policies for pet photos
CREATE POLICY "Users can upload their pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Pet photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can update their pet photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their pet photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for log attachments
CREATE POLICY "Users can upload log attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'log-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Log attachments are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'log-attachments');

CREATE POLICY "Users can delete their log attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'log-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for performance
CREATE INDEX idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX idx_logs_pet_id ON public.logs(pet_id);
CREATE INDEX idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX idx_logs_type ON public.logs(type);
CREATE INDEX idx_attachments_log_id ON public.attachments(log_id);
CREATE INDEX idx_reminders_owner_id ON public.reminders(owner_id);
CREATE INDEX idx_reminders_next_run ON public.reminders(next_run) WHERE enabled = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_pets
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_logs
  BEFORE UPDATE ON public.logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reminders
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();