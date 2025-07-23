-- Alternative Solution: Update Registration Page to Create User Record
-- If the trigger approach doesn't work, we can modify the registration logic

-- First, run this updated trigger script:

-- Automatic User Creation Trigger for DreamMotion (BYPASS RLS)
-- This trigger will automatically create a user record in the public.users table
-- whenever someone signs up through Supabase Auth

-- 1. Create a function that will be called on new user signup (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user record with default credits, bypassing RLS
  INSERT INTO public.users (id, email, credits, created_at)
  VALUES (NEW.id, NEW.email, 10, NOW())
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE LOG 'Error creating user record for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Grant necessary permissions for the trigger function
GRANT INSERT ON public.users TO postgres;
GRANT INSERT ON public.users TO service_role;

-- 3. Create the trigger that calls this function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Also create a policy that allows the trigger function to insert
DROP POLICY IF EXISTS "Allow trigger to insert users" ON users;
CREATE POLICY "Allow trigger to insert users" ON users
FOR INSERT TO postgres
WITH CHECK (true);

-- 5. Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 6. Test function exists
SELECT 'handle_new_user function exists: ' || CASE WHEN EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
) THEN 'YES' ELSE 'NO' END as function_status;

-- 7. Check if RLS is properly configured
SELECT 'Users table RLS enabled: ' || CASE WHEN EXISTS (
  SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true
) THEN 'YES' ELSE 'NO' END as rls_status;
