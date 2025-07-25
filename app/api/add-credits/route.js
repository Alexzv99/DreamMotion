import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Payhip product codes and their corresponding credit amounts
const CREDIT_PLANS = {
  'CLhkc': { name: 'Starter Plan', credits: 100, price: 4.99 },
  'USlOw': { name: 'Elite Plan', credits: 2000, price: 49.99 },
  '3Fh0t': { name: 'Basic Plan', credits: 250, price: 9.99 },
  'zv78T': { name: 'Pro Plan', credits: 600, price: 19.99 }
};

export async function POST(request) {
  try {
    const { user_id, product_code, transaction_id } = await request.json();

    if (!user_id || !product_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get credit amount for this product
    const planDetails = CREDIT_PLANS[product_code];
    if (!planDetails) {
      return NextResponse.json({ error: 'Invalid product code' }, { status: 400 });
    }

    // Check if this transaction has already been processed
    if (transaction_id) {
      const { data: existingTransaction } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('sale_id', transaction_id)
        .eq('user_id', user_id)
        .single();

      if (existingTransaction) {
        return NextResponse.json({ 
          error: 'Transaction already processed',
          already_processed: true 
        }, { status: 400 });
      }
    }

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits, email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add credits to user account
    const newCredits = userData.credits + planDetails.credits;
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', user_id);

    if (updateError) {
      console.error('Failed to update user credits:', updateError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // Log the transaction
    const { error: logError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user_id,
        amount: planDetails.credits,
        type: 'purchase',
        plan_name: planDetails.name,
        sale_id: transaction_id || `manual_${Date.now()}`,
        product_id: product_code,
        price_paid: planDetails.price,
        currency: 'USD',
        notes: 'Credits added via return URL processing'
      });

    if (logError) {
      console.warn('Failed to log transaction:', logError);
    }

    console.log(`Successfully added ${planDetails.credits} credits to user ${user_id}. New balance: ${newCredits}`);

    return NextResponse.json({
      success: true,
      credits_added: planDetails.credits,
      new_balance: newCredits,
      plan_name: planDetails.name
    });

  } catch (error) {
    console.error('Credit addition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
