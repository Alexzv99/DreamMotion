-- Create generations table for async video processing
-- Copy and paste this into your Supabase SQL Editor and run it

-- 1. Create the generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prediction_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'genimage' or 'genvideo'
  model TEXT, -- video model name (e.g., 'hailuo-02', 'kling-v2.1', etc.)
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'starting', -- 'starting', 'processing', 'succeeded', 'failed'
  output TEXT, -- URL to generated content
  error TEXT, -- Error message if failed
  credit_cost INTEGER NOT NULL, -- Fixed column name
  refunded BOOLEAN DEFAULT FALSE, -- Track if credits were refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable RLS on the generations table
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 3. Allow authenticated users to insert their own generation records
CREATE POLICY "Users can insert their own generations" ON generations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to view their own generation records
CREATE POLICY "Users can view their own generations" ON generations
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 5. Allow authenticated users to update their own generation records (for status updates)
CREATE POLICY "Users can update their own generations" ON generations
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_prediction_id ON generations(prediction_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);

-- 7. Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add refunded column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generations' AND column_name = 'refunded') THEN
        ALTER TABLE generations ADD COLUMN refunded BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Rename credits_cost to credit_cost if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'generations' AND column_name = 'credits_cost') THEN
        ALTER TABLE generations RENAME COLUMN credits_cost TO credit_cost;
    END IF;
END $$;

-- 8. Verify the setup
SELECT 'Generations table setup complete!' as status;

-- Show current policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'generations'; 
WHERE tablename = 'generations';

-- 8. Create RPC function to increase user credits (for refunds)
CREATE OR REPLACE FUNCTION increase_user_credits(amount INTEGER, uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET credits = credits + amount 
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increase_user_credits TO authenticated;
