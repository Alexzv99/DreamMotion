-- Automatic User Creation Trigger for DreamMotion
-- This trigger will automatically create a user record in the public.users table
-- whenever someone signs up through Supabase Auth

-- 1. Create a function that will be called on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user record with default credits
  INSERT INTO public.users (id, email, credits, created_at)
  VALUES (NEW.id, NEW.email, 10, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger that calls this function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Test function exists
SELECT 'handle_new_user function exists: ' || CASE WHEN EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
) THEN 'YES' ELSE 'NO' END as function_status;
