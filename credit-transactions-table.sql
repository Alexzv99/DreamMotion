-- Create credit_transactions table for logging all credit additions and deductions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'deduction', 'bonus', 'refund')),
  plan_name VARCHAR(100),
  sale_id VARCHAR(100),
  product_id VARCHAR(50),
  price_paid DECIMAL(10,2),
  currency VARCHAR(3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_sale_id ON credit_transactions(sale_id);

-- Enable RLS (Row Level Security)
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert transactions (webhooks)
CREATE POLICY "Service role can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON credit_transactions TO authenticated;
GRANT INSERT ON credit_transactions TO service_role;
