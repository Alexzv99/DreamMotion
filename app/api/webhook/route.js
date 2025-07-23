import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
    
    // Update the generation status in database
    const { error: updateError } = await supabase
      .from('generations')
      .update({
        status,
        output: output ? (Array.isArray(output) ? output[0] : output) : null,
        error: error?.detail || error || null,
        completed_at: status === 'succeeded' || status === 'failed' ? new Date().toISOString() : null
      })
      .eq('prediction_id', id);
    
    if (updateError) {
      console.error('❌ Error updating generation status:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
    
    console.log(`✅ Updated generation ${id} with status: ${status}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
