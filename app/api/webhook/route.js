import { NextResponse } from 'next/server';

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
    
    console.log(`✅ Webhook processed for prediction ${id} with status: ${status}`);
    
    // For now, just log the webhook data - we'll query Replicate directly for status
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
