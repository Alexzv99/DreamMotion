-- Create or replace the add_user_credits function for automatic credit addition
CREATE OR REPLACE FUNCTION add_user_credits(amount INTEGER, uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE id = uid) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User not found: %', uid;
  END IF;

  -- Add credits to user account
  UPDATE users 
  SET credits = credits + amount
  WHERE id = uid;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update credits for user: %', uid;
  END IF;

  RETURN TRUE;
END;
$$;

-- Grant execute permission to service role for webhook processing
GRANT EXECUTE ON FUNCTION add_user_credits(INTEGER, UUID) TO service_role;
