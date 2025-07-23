import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const predictionId = searchParams.get('id');
    
    if (!predictionId) {
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
    }
    
    // Get the generation status directly from Replicate
    const prediction = await replicate.predictions.get(predictionId);
    
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output ? (Array.isArray(prediction.output) ? prediction.output[0] : prediction.output) : null,
      error: prediction.error,
      created_at: prediction.created_at,
      completed_at: prediction.completed_at || null
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({ 
      error: 'Status check failed',
      detail: error.message 
    }, { status: 500 });
  }
}
