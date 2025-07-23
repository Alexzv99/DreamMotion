import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    console.log('🎣 Webhook received from Replicate');
    
    const body = await req.json();
    console.log('📥 Webhook payload:', body);
    
    const { id, status, output, error } = body;
    
    if (!id) {
      console.error('❌ No prediction ID in webhook');
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
    }
    
    console.log(`🔄 Processing webhook for prediction ${id} with status: ${status}`);
    
    // Create Supabase admin client for database updates
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Check if this is an async generation we're tracking
    const { data: generation, error: queryError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('prediction_id', id)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database query error:', queryError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
    
    if (!generation) {
      console.log(`ℹ️ Prediction ${id} not found in async generations table - probably a sync generation`);
      return NextResponse.json({ success: true, message: 'Not an async generation' });
    }
    
    console.log(`✅ Found async generation record for ${id}`);
    
    // Update the generation status
    let updateData = {
      status: status,
      completed_at: new Date().toISOString()
    };
    
    if (status === 'succeeded' && output) {
      const finalOutput = Array.isArray(output) ? output[0] : output;
      updateData.output = finalOutput;
      console.log(`✅ Setting output URL: ${finalOutput}`);
    } else if (status === 'failed' && error) {
      updateData.error = error;
      console.log(`❌ Setting error: ${error}`);
      
      // Refund credits for failed async generation
      if (generation.user_id && generation.credit_cost) {
        console.log(`💰 Refunding ${generation.credit_cost} credits to user ${generation.user_id} for failed async generation`);
        
        const { error: refundError } = await supabaseAdmin.rpc('increase_user_credits', {
          amount: generation.credit_cost,
          uid: generation.user_id,
        });

        if (refundError) {
          console.error('❌ Credit refund failed in webhook:', refundError);
        } else {
          console.log('✅ Credits refunded successfully in webhook');
          updateData.refunded = true;
        }
      }
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('prediction_id', id);
    
    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
    
    console.log(`✅ Webhook processed successfully for prediction ${id}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
