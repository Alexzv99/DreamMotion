import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

// Payhip product codes and their corresponding credit amounts
const CREDIT_PLANS = {
  'CLhkc': { name: 'Starter Plan', credits: 100, price: '$4.99' },
  'USlOw': { name: 'Elite Plan', credits: 2000, price: '$49.99' },
  '3Fh0t': { name: 'Basic Plan', credits: 250, price: '$9.99' },
  'zv78T': { name: 'Pro Plan', credits: 600, price: '$19.99' }
};

export async function POST(request) {
  try {
    const body = await request.text();
    console.log('Payhip webhook received:', body);

    // Parse the webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Failed to parse webhook JSON:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify it's a successful sale
    if (webhookData.event !== 'sale_completed') {
      console.log('Webhook event is not sale_completed:', webhookData.event);
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const {
      product_id,
      buyer_email,
      sale_id,
      amount,
      currency
    } = webhookData;

    console.log('Processing sale:', {
      product_id,
      buyer_email,
      sale_id,
      amount,
      currency
    });

    // Get credit amount for this product
    const planDetails = CREDIT_PLANS[product_id];
    if (!planDetails) {
      console.error('Unknown product ID:', product_id);
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits, email')
      .eq('email', buyer_email)
      .single();

    if (userError || !userData) {
      console.error('User not found for email:', buyer_email, userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add credits to user account
    const newCredits = userData.credits + planDetails.credits;
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Failed to update user credits:', updateError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // Log the transaction for record keeping
    const { error: logError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userData.id,
        amount: planDetails.credits,
        type: 'purchase',
        plan_name: planDetails.name,
        sale_id: sale_id,
        product_id: product_id,
        price_paid: amount,
        currency: currency
      });

    if (logError) {
      console.warn('Failed to log transaction:', logError);
      // Don't fail the request for logging errors
    }

    console.log(`Successfully added ${planDetails.credits} credits to user ${buyer_email}. New balance: ${newCredits}`);

    return NextResponse.json({
      success: true,
      message: `Added ${planDetails.credits} credits`,
      new_balance: newCredits
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Payhip webhook endpoint' });
}
