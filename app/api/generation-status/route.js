import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Simple JWT decode without verification (for performance)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const predictionId = searchParams.get('id');
    
    if (!predictionId) {
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
    }
    
    console.log(`🔍 [${new Date().toISOString()}] STATUS CHECK for prediction: ${predictionId}`);
    
    // First, check our database for async generations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log(`📊 Checking database for ${predictionId}...`);
    
    // Try to get the user ID from the request headers (authentication)
    const authHeader = req.headers.get('authorization');
    let currentUserId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = decodeJWT(token);
        if (payload && payload.sub) {
          currentUserId = payload.sub;
          console.log(`🔍 Extracted user ID from token: ${currentUserId}`);
        }
      } catch (tokenError) {
        console.log(`⚠️ Could not extract user ID from token:`, tokenError.message);
      }
    }
    
    // Query database with user filter if available - use service role for admin access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    let dbQuery = supabaseAdmin.from('generations').select('*').eq('prediction_id', predictionId);
    
    if (currentUserId) {
      console.log(`🔧 Adding user filter to database query: ${currentUserId}`);
      dbQuery = dbQuery.eq('user_id', currentUserId);
    }
    
    const { data: generation, error: dbError } = await dbQuery.maybeSingle();
    
    if (dbError) {
      console.error(`❌ CRITICAL: Database lookup failed for ${predictionId}:`, dbError);
      console.error(`❌ This is likely causing the 30-second fallback!`);
      console.error(`❌ DB Error details:`, {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
    } else if (!generation) {
      console.error(`❌ CRITICAL: No generation record found for ${predictionId}`);
      console.error(`❌ This is likely causing the 30-second fallback!`);
      console.log(`🔍 Query was: prediction_id=${predictionId}${currentUserId ? `, user_id=${currentUserId}` : ''}`);
    }
    
    if (generation && !dbError) {
      console.log(`✅ Found generation in database with status: ${generation.status}`);
      console.log(`📊 Full generation record:`, {
        id: generation.id,
        prediction_id: generation.prediction_id,
        status: generation.status,
        created_at: generation.created_at,
        user_id: generation.user_id,
        model: generation.model,
        type: generation.type
      });
      
      // If completed, return database result
      if (generation.status === 'succeeded' || generation.status === 'failed') {
        return NextResponse.json({
          id: generation.prediction_id,
          status: generation.status,
          output: generation.output,
          error: generation.error,
          created_at: generation.created_at,
          completed_at: generation.completed_at,
          model: generation.model,
          type: generation.type,
          refunded: generation.refunded || false
        });
      }
      
      // If still processing, check Replicate for latest status
      console.log(`⏳ Generation still ${generation.status}, checking Replicate for updates...`);
    } else {
      console.log(`❌ Generation not found in database OR database error occurred`);
      console.log(`❌ This is the ROOT CAUSE of the 30-second fallback issue!`);
      if (dbError) {
        console.log(`❌ Database error was:`, dbError);
      } else {
        console.log(`❌ No database error, but no generation record found`);
      }
      console.log(`ℹ️ Checking Replicate directly as fallback...`);
    }
    
    // Get the generation status directly from Replicate (fallback or status update)
    console.log(`🔄 Querying Replicate for ${predictionId}...`);
    const prediction = await replicate.predictions.get(predictionId);
    
    console.log(`🔄 Replicate status: ${prediction.status}`);
    console.log(`📊 Full Replicate response:`, {
      id: prediction.id,
      status: prediction.status,
      created_at: prediction.created_at,
      started_at: prediction.started_at,
      completed_at: prediction.completed_at,
      error: prediction.error,
      logs_length: prediction.logs ? prediction.logs.length : 0
    });
    
    // If we have a database record and status changed, update it
    if (generation && prediction.status !== generation.status) {
      console.log(`🔄 Updating database status from ${generation.status} to ${prediction.status}`);
      
      const updateData = {
        status: prediction.status
      };
      
      if (prediction.status === 'succeeded' && prediction.output) {
        updateData.output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        updateData.completed_at = prediction.completed_at || new Date().toISOString();
      } else if (prediction.status === 'failed') {
        updateData.error = prediction.error;
        updateData.completed_at = prediction.completed_at || new Date().toISOString();
        
        // Refund credits for failed async generation if not already refunded
        if (generation.user_id && generation.credit_cost && !generation.refunded) {
          console.log(`💰 Refunding ${generation.credit_cost} credits to user ${generation.user_id} for failed async generation`);
          
          // Create admin client for refund
          const supabaseAdminForRefund = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          );
          
          const { error: refundError } = await supabaseAdminForRefund.rpc('increase_user_credits', {
            amount: generation.credit_cost,
            uid: generation.user_id,
          });

          if (refundError) {
            console.error('❌ Credit refund failed in status check:', refundError);
          } else {
            console.log('✅ Credits refunded successfully in status check');
            updateData.refunded = true;
          }
        }
      }
      
      // Update in background, don't wait - use admin client
      supabaseAdmin
        .from('generations')
        .update(updateData)
        .eq('prediction_id', predictionId)
        .eq('user_id', generation.user_id) // Add user filter for consistency
        .then(() => console.log(`✅ Database updated for ${predictionId}`))
        .catch(err => console.error(`❌ Database update failed:`, err));
    }
    
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output ? (Array.isArray(prediction.output) ? prediction.output[0] : prediction.output) : null,
      error: prediction.error,
      created_at: prediction.created_at,
      completed_at: prediction.completed_at || null,
      model: generation?.model || 'unknown',
      type: generation?.type || 'unknown',
      refunded: generation?.refunded || false
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({ 
      error: 'Status check failed',
      detail: error.message 
    }, { status: 500 });
  }
}
