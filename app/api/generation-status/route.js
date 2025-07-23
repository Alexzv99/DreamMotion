import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const predictionId = searchParams.get('id');
    
    if (!predictionId) {
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
    }
    
    // Get the generation status from database
    const { data: generation, error } = await supabase
      .from('generations')
      .select('*')
      .eq('prediction_id', predictionId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching generation status:', error);
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: generation.prediction_id,
      status: generation.status,
      output: generation.output,
      error: generation.error,
      created_at: generation.created_at,
      completed_at: generation.completed_at
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
