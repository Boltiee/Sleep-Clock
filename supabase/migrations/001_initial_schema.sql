-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_json JSONB NOT NULL DEFAULT '[]',
  colors_json JSONB NOT NULL DEFAULT '{}',
  dim_json JSONB NOT NULL DEFAULT '{}',
  chores_enabled BOOLEAN NOT NULL DEFAULT true,
  chores_json JSONB NOT NULL DEFAULT '[]',
  reward_text TEXT NOT NULL DEFAULT 'Nice work!',
  tonie_enabled BOOLEAN NOT NULL DEFAULT false,
  tonie_list_json JSONB NOT NULL DEFAULT '[]',
  tonie_chooser_duration INTEGER NOT NULL DEFAULT 0,
  last_tonie_id TEXT,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_volume INTEGER NOT NULL DEFAULT 50,
  show_clock BOOLEAN NOT NULL DEFAULT false,
  pin_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily state table
CREATE TABLE daily_state (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  chores_done_json JSONB NOT NULL DEFAULT '[]',
  books_count INTEGER NOT NULL DEFAULT 0,
  last_completed_step TEXT NOT NULL DEFAULT 'none',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (profile_id, date)
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_daily_state_profile_date ON daily_state(profile_id, date);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_state ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profiles
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Settings: Users can access settings for their profiles
CREATE POLICY "Users can view settings for their profiles"
  ON settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = settings.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert settings for their profiles"
  ON settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = settings.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update settings for their profiles"
  ON settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = settings.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete settings for their profiles"
  ON settings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = settings.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Daily state: Users can access daily state for their profiles
CREATE POLICY "Users can view daily state for their profiles"
  ON daily_state FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = daily_state.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert daily state for their profiles"
  ON daily_state FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = daily_state.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update daily state for their profiles"
  ON daily_state FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = daily_state.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete daily state for their profiles"
  ON daily_state FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = daily_state.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_state_updated_at
  BEFORE UPDATE ON daily_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for settings and daily_state
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_state;

