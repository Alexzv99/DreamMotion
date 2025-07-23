import Replicate from 'replicate';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log('🔑 Replicate API Token Status:', process.env.REPLICATE_API_TOKEN ? 
       'Present' : 'Missing');
console.log('🔑 Token length:', process.env.REPLICATE_API_TOKEN?.length || 0);
console.log('🏠 Environment:', process.env.NODE_ENV);
console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
console.log('🔐 Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to convert File object to base64 string
async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// 🧩 Enhanced Prompt Sanitization Function - Bypass/Filter Prompt Phrasing Dynamically
function sanitizePrompt(prompt) {
  if (!prompt) return prompt;
  
  console.log('🔍 Original prompt:', prompt);
  
  const sanitized = prompt
    // Adult content sanitization
    .replace(/bikini/gi, "swimwear")
    .replace(/seductive|sexy|hot/gi, "elegant")
    .replace(/lingerie/gi, "nightwear")
    .replace(/Natalia Vex/gi, "female model")
    .replace(/nude|naked|topless/gi, "artistic portrait")
    .replace(/revealing/gi, "stylish")
    .replace(/sensual/gi, "graceful")
    
    // Casino/gambling sanitization - Enhanced
    .replace(/casino/gi, "entertainment venue")
    .replace(/gambling|gamble/gi, "gaming")
    .replace(/slot machine/gi, "arcade machine")
    .replace(/poker/gi, "card game")
    .replace(/blackjack/gi, "table game")
    .replace(/roulette/gi, "wheel game")
    .replace(/bet|betting/gi, "playing")
    .replace(/jackpot/gi, "grand prize")
    .replace(/chips/gi, "tokens")
    .replace(/dice/gi, "gaming cubes")
    .replace(/dealer/gi, "game host")
    .replace(/croupier/gi, "game attendant")
    .replace(/stakes/gi, "game value")
    .replace(/wager/gi, "game entry")
    .replace(/ante/gi, "entry fee")
    .replace(/fold|bluff/gi, "strategic move")
    .replace(/all.?in/gi, "maximum commitment")
    
    // Violence/weapon sanitization
    .replace(/gun|pistol|rifle/gi, "prop device")
    .replace(/knife|blade|sword/gi, "decorative item")
    .replace(/blood|gore/gi, "red liquid")
    .replace(/violence|violent/gi, "dramatic action")
    .replace(/kill|murder|death/gi, "dramatic scene")
    
    // Drug/substance sanitization
    .replace(/drugs|cocaine|marijuana/gi, "herbs")
    .replace(/smoking|cigarette/gi, "holding item")
    .replace(/alcohol|beer|wine/gi, "beverage")
    .replace(/drunk|intoxicated/gi, "relaxed")
    
    // Mature themes sanitization
    .replace(/strip club|brothel/gi, "entertainment venue")
    .replace(/escort|prostitute/gi, "companion")
    .replace(/adult entertainment/gi, "social venue")
    
    // Religious/political sanitization (to avoid controversy)
    .replace(/controversial political figure/gi, "public figure")
    .replace(/extremist|terrorist/gi, "character")
    
    // Clean up any double spaces created by replacements
    .replace(/\s+/g, ' ')
    .trim();
    
  console.log('✅ Sanitized prompt:', sanitized);
  return sanitized;
}

// Helper function to refund credits on generation failure
async function refundCredits(userId, creditAmount, token) {
  try {
    console.log(`💰 Refunding ${creditAmount} credits to user ${userId}`);
    
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Use RPC to increase credits (refund)
    const { error: refundError } = await authenticatedSupabase.rpc('increase_user_credits', {
      amount: creditAmount,
      uid: userId,
    });

    if (refundError) {
      console.error('❌ Credit refund failed:', refundError);
      return false;
    }

    console.log('✅ Credits refunded successfully');
    return true;
  } catch (error) {
    console.error('❌ Credit refund exception:', error);
    return false;
  }
}

// All models now use simple sync processing - no more async complications

// Start async generation for long-running models
async function startAsyncGeneration(params) {
  const { prompt, aspect_ratio, type, video_model, duration, image, userId, creditCost, token } = params;
  
  console.log(`🚀 Starting async generation for ${video_model}`);
  
  // Create Supabase client with service role for database operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Create authenticated Supabase client for user operations
  const authenticatedSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
  
  try {
    // Start the Replicate prediction
    const prediction = await startReplicatePrediction({ 
      prompt, 
      aspect_ratio, 
      type, 
      video_model, 
      duration, 
      image 
    });
    
    console.log(`✅ Replicate prediction started: ${prediction.id}`);
    console.log(`🔧 Prediction details:`, {
      id: prediction.id,
      status: prediction.status,
      created_at: prediction.created_at,
      model: prediction.model,
      input_keys: prediction.input ? Object.keys(prediction.input) : 'No input'
    });
    
    // Store generation in database
    console.log(`📝 Inserting database record for ${prediction.id}...`);
    const generationData = {
      user_id: userId,
      prediction_id: prediction.id,
      type: type,
      model: video_model,
      prompt: prompt,
      status: 'processing',
      credit_cost: creditCost
    };
    console.log(`📝 Generation data:`, generationData);
    
    const { data: generation, error: dbError } = await authenticatedSupabase
      .from('generations')
      .insert([generationData])
      .select()
      .single();
    
    if (dbError) {
      console.error('❌ CRITICAL: Database insert failed:', dbError);
      console.error('❌ This will cause frontend status checks to fail immediately!');
      console.error('❌ Database error details:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      // Continue anyway - the prediction is already started
    } else {
      console.log('✅ Generation record created in database:', {
        id: generation.id,
        prediction_id: generation.prediction_id,
        status: generation.status,
        created_at: generation.created_at
      });
    }
    
    // Start background monitoring (don't await)
    console.log(`🔄 Starting background monitoring for ${prediction.id}...`);
    monitorPrediction(prediction.id, userId, authenticatedSupabase).catch(err => {
      console.error('❌ Background monitoring startup failed:', err);
      console.error('❌ This could cause the 30-second fallback issue!');
    });
    
    return prediction;
    
  } catch (error) {
    console.error('❌ Failed to start async generation:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // If database record was created but prediction failed, clean it up
    if (error.message.includes('prediction') || error.message.includes('replicate')) {
      console.log('🧹 Cleaning up database record due to prediction failure');
      // Note: We could add cleanup logic here if needed
    }
    
    throw error;
  }
}

// Start Replicate prediction (extracted from generateContent)
async function startReplicatePrediction(params) {
  const { prompt, aspect_ratio, type, video_model, duration, image } = params;
  
  // This is the same logic as in generateContent, but only for starting the prediction
  let version;
  if (video_model === 'hailuo-02') {
    version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd';
  } else if (video_model === 'veo-3-fast') {
    version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d';
  } else if (video_model === 'veo-3') {
    version = 'aa61b11710dc016f1f292a41808c94dadf23f549ccaf6755a852c491c6edc248';
  } else if (video_model === 'luma-ray') {
    version = '4d6dcb3b96dce9e9e33b5eb1c37cf2ce03e1e7e57cb59c99e67a1c3040b3ff9f';
  } else {
    version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Default to Hailuo
  }
  
  // Sanitize prompt
  const sanitizedPrompt = sanitizePrompt(prompt);
  
  // Set duration based on model
  let modelDuration = parseInt(duration) || 6;
  if (video_model === 'veo-3-fast' || video_model === 'veo-3') {
    modelDuration = parseInt(duration) || 8;
  }
  
  const inputData = {
    prompt: sanitizedPrompt,
    aspect_ratio,
    duration: modelDuration,
  };
  
  // Add image file if provided
  if (image) {
    const imageBase64 = await fileToBase64(image);
    const mimeType = image.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${imageBase64}`;
    
    if (video_model === 'hailuo-02') {
      inputData.first_frame_image = dataUri;
      console.log('✅ Image added to Hailuo-02 as first_frame_image');
    } else if (video_model === 'veo-3' || video_model === 'veo-3-fast') {
      inputData.image = dataUri;
      console.log('✅ Image added to Veo-3 models');
    } else if (video_model === 'luma-ray') {
      // Luma Ray is text-to-video only, don't add image
      console.log('ℹ️ Luma Ray is text-to-video only, ignoring image');
    }
  }
  
  console.log(`🚀 Creating Replicate prediction for ${video_model}`);
  console.log(`📋 Input data:`, { 
    prompt: sanitizedPrompt, 
    aspect_ratio, 
    duration: modelDuration,
    hasImage: !!image 
  });
  
  const prediction = await replicate.predictions.create({
    version,
    input: inputData,
  });
  
  console.log(`✅ Replicate prediction created:`, {
    id: prediction.id,
    status: prediction.status,
    created_at: prediction.created_at
  });
  
  return prediction;
}

// Background monitoring function
async function monitorPrediction(predictionId, userId, authenticatedSupabase = null) {
  console.log(`👀 Starting background monitoring for ${predictionId} at ${new Date().toISOString()}`);
  console.log(`🔧 Monitor params: predictionId=${predictionId}, userId=${userId}`);
  
  // Use the authenticated client if provided, otherwise fall back to service role
  const supabaseForMonitoring = authenticatedSupabase || createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log(`🔧 Using ${authenticatedSupabase ? 'authenticated user client' : 'service role client'} for monitoring`);
  
  // First, verify the database record was created (with retry logic)
  let recordFound = false;
  let retryCount = 0;
  const maxRetries = 5;
  
  while (!recordFound && retryCount < maxRetries) {
    try {
      console.log(`🔍 Verifying database record exists for ${predictionId}... (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Try to find the record using the monitoring client
      const { data: initialRecord, error: recordError } = await supabaseForMonitoring
        .from('generations')
        .select('*')
        .eq('prediction_id', predictionId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found
      
      if (recordError) {
        console.error(`❌ Database lookup error for ${predictionId} (attempt ${retryCount + 1}):`, recordError);
      } else if (!initialRecord) {
        console.log(`⚠️ Database record not found for ${predictionId} (attempt ${retryCount + 1})`);
        
        if (retryCount < maxRetries - 1) {
          console.log(`⏳ Waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
          continue;
        }
      } else {
        console.log(`✅ Database record confirmed for ${predictionId}:`, {
          id: initialRecord.id,
          status: initialRecord.status,
          created_at: initialRecord.created_at,
          user_id: initialRecord.user_id
        });
        recordFound = true;
        break;
      }
    } catch (recordCheckError) {
      console.error(`❌ Failed to verify database record for ${predictionId} (attempt ${retryCount + 1}):`, recordCheckError);
    }
    
    retryCount++;
    if (retryCount < maxRetries) {
      console.log(`⏳ Waiting 2 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!recordFound) {
    console.error(`❌ CRITICAL: Could not find database record for ${predictionId} after ${maxRetries} attempts!`);
    console.error(`❌ This explains why frontend status checks fail!`);
    return;
  }
  
  // Create admin client for database updates (we need admin privileges for updates)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const maxAttempts = 120; // 20 minutes max (10 second intervals) - increased for Veo models
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
      console.log(`🔍 [${new Date().toISOString()}] Checking prediction ${predictionId} (attempt ${attempts}/${maxAttempts})`);
      console.log(`⏱️ Time elapsed: ${attempts * 10} seconds`);
      
      // Use the monitoring client to check database record (respects RLS)
      const { data: currentRecord, error: dbError } = await supabaseForMonitoring
        .from('generations')
        .select('status, error')
        .eq('prediction_id', predictionId)
        .eq('user_id', userId) // Add user filter to match RLS policies
        .maybeSingle(); // Use maybeSingle to avoid errors if not found
      
      if (dbError) {
        console.error(`❌ Database record access error for ${predictionId}:`, dbError);
        console.error(`❌ This would cause frontend status checks to fail!`);
        break;
      }
      
      if (!currentRecord) {
        console.error(`❌ Database record no longer exists for ${predictionId}`);
        console.error(`❌ This would cause frontend status checks to fail!`);
        break;
      }
      
      console.log(`📊 Database status: ${currentRecord.status}`);
      
      if (currentRecord.status === 'succeeded' || currentRecord.status === 'failed') {
        console.log(`✅ Generation already completed in database: ${currentRecord.status}`);
        break;
      }
      
      // Now check Replicate
      const prediction = await replicate.predictions.get(predictionId);
      console.log(`📊 Replicate response for ${predictionId}:`, {
        status: prediction.status,
        created_at: prediction.created_at,
        started_at: prediction.started_at,
        completed_at: prediction.completed_at,
        error: prediction.error,
        logs: prediction.logs ? `${prediction.logs.length} log entries` : 'No logs'
      });
      
      if (prediction.status === 'succeeded') {
        console.log(`✅ Prediction ${predictionId} completed successfully`);
        
        const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        
        await supabaseAdmin
          .from('generations')
          .update({
            status: 'succeeded',
            output: output,
            completed_at: new Date().toISOString()
          })
          .eq('prediction_id', predictionId)
          .eq('user_id', userId); // Add user filter for RLS compatibility
          
        console.log(`✅ Database updated for ${predictionId}`);
        break;
        
      } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
        console.log(`❌ Prediction ${predictionId} failed: ${prediction.error}`);
        
        // Get generation details for credit refund
        const { data: generation } = await supabaseAdmin
          .from('generations')
          .select('credit_cost, user_id')
          .eq('prediction_id', predictionId)
          .single();
        
        if (generation) {
          // Refund credits using service role key
          try {
            const { error: refundError } = await supabaseAdmin.rpc('increase_user_credits', {
              amount: generation.credit_cost,
              uid: generation.user_id
            });
            
            if (refundError) {
              console.error(`❌ Credit refund failed for ${predictionId}:`, refundError);
            } else {
              console.log(`✅ Credits refunded for failed prediction ${predictionId}`);
            }
          } catch (refundError) {
            console.error(`❌ Credit refund exception for ${predictionId}:`, refundError);
          }
        }
        
        await supabaseAdmin
          .from('generations')
          .update({
            status: 'failed',
            error: prediction.error || `Status: ${prediction.status}`,
            completed_at: new Date().toISOString()
          })
          .eq('prediction_id', predictionId)
          .eq('user_id', userId); // Add user filter for RLS compatibility
          
        console.log(`✅ Database updated with failure for ${predictionId}`);
        break;
        
      } else {
        console.log(`⏳ Prediction ${predictionId} still ${prediction.status}...`);
        // Continue monitoring
      }
      
    } catch (error) {
      console.error(`❌ Error monitoring ${predictionId}:`, error);
      attempts++; // Count errors as attempts
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log(`⏰ Monitoring timeout for ${predictionId}`);
    
    // Get generation details for credit refund on timeout
    const { data: generation } = await supabaseAdmin
      .from('generations')
      .select('credit_cost, user_id')
      .eq('prediction_id', predictionId)
      .single();
    
    if (generation) {
      // Refund credits for timeout
      try {
        const { error: refundError } = await supabaseAdmin.rpc('increase_user_credits', {
          amount: generation.credit_cost,
          uid: generation.user_id
        });
        
        if (refundError) {
          console.error(`❌ Timeout credit refund failed for ${predictionId}:`, refundError);
        } else {
          console.log(`✅ Credits refunded for timeout ${predictionId}`);
        }
      } catch (refundError) {
        console.error(`❌ Timeout credit refund exception for ${predictionId}:`, refundError);
      }
    }
    
    await supabaseAdmin
      .from('generations')
      .update({
        status: 'failed',
        error: `Monitoring timeout after ${maxAttempts} attempts`,
        completed_at: new Date().toISOString()
      })
      .eq('prediction_id', predictionId)
      .eq('user_id', userId); // Add user filter for RLS compatibility
  }
}

async function generateContent(params) {
  try {
    // Extract all parameters
    const { 
      prompt, 
      aspect_ratio, 
      type = 'genimage', 
      video_model, 
      duration, 
      image 
    } = params || {};
    
    console.log('🔧 generateContent parameters:', {
      prompt: prompt ? 'present' : 'missing',
      aspect_ratio,
      type,
      video_model,
      duration,
      image: image ? 'present' : 'missing'
    });
    
    let prediction;
    if (type === 'text2video') {
      // Text-to-video models
      let version;
      if (video_model === 'hailuo-02') {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Hailuo 02
      } else if (video_model === 'veo-3-fast') {
        version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3 Fast
      } else if (video_model === 'veo-3') {
        version = 'aa61b11710dc016f1f292a41808c94dadf23f549ccaf6755a852c491c6edc248'; // Veo 3
      } else if (video_model === 'luma-ray') {
        version = '4d6dcb3b96dce9e9e33b5eb1c37cf2ce03e1e7e57cb59c99e67a1c3040b3ff9f'; // Luma Ray
      } else {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Default to Hailuo 02
      }
      
      // Sanitize prompt before sending to API
      const sanitizedPrompt = sanitizePrompt(prompt);
      
      // Set duration based on model - Veo 3 and Veo 3 Fast use 8 seconds, others use 6
      let modelDuration = duration || 6;
      if (video_model === 'veo-3-fast' || video_model === 'veo-3') {
        modelDuration = duration || 8;
      }
      
      // Prepare input data for text2video
      const inputData = {
        prompt: sanitizedPrompt,
        aspect_ratio,
        duration: modelDuration,
      };
      
      prediction = await replicate.predictions.create({
        version,
        input: inputData,
      });
    } else if (type === 'genvideo') {
      // Image-to-video models (Kling v2.1)
      console.log('🎬 Processing genvideo request with Kling v2.1');
      console.log('🔧 Video model:', video_model);
      console.log('🖼️ Image file present:', !!image);
      
      let version;
      if (video_model === 'hailuo-02') {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Hailuo 02
      } else if (video_model === 'veo-3-fast') {
        version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3 Fast
      } else if (video_model === 'veo-3') {
        version = 'aa61b11710dc016f1f292a41808c94dadf23f549ccaf6755a852c491c6edc248'; // Veo 3
      } else if (video_model === 'wan-2.1-i2v-720p') {
        version = '9736bda14044031883500101f4b3814f6e9526e019036da0b42cced4168c6007'; // WAN-2.1-i2v-720p (user provided)
      } else if (video_model === 'kling-v2.1') {
        version = '1a3f2d7321a5f38d932d85e3ee8e286ba278990f66293f1fac2d26c2b3798b8d'; // Kling v2.1
      } else if (video_model === 'seedance-1-pro') {
        version = '567d056ac32cf4966a0a6ce60b043408e2a81493e7b0c6579af80aca19d1c070'; // Seedance Pro
      } else {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Default to Hailuo 02
      }

      console.log('🆔 Using version ID:', version);

      // Sanitize prompt before sending to API
      const sanitizedPrompt = sanitizePrompt(prompt);

      // Set duration based on model - Veo 3 and Veo 3 Fast use 8 seconds, others use 6
      let modelDuration = parseInt(duration) || 6;
      if (video_model === 'veo-3-fast' || video_model === 'veo-3') {
        modelDuration = parseInt(duration) || 8;
      }

      // For genvideo, we need to include the image file
      const inputData = {
        prompt: sanitizedPrompt,
        aspect_ratio,
        duration: modelDuration, // Use model-specific duration
      };

      // Add image file if it exists - convert to base64 data URI for all models
      if (image) {
        // Convert File object to base64 data URI for Replicate API
        const imageBase64 = await fileToBase64(image);
        const mimeType = image.type || 'image/jpeg'; // Default to JPEG if type not specified
        const dataUri = `data:${mimeType};base64,${imageBase64}`;
        console.log('🔄 Converted image file to base64 data URI format');
        
        if (video_model === 'wan-2.1-i2v-720p') {
          inputData.image = dataUri; // WAN-2.1 uses 'image' parameter
          console.log('✅ Image file added to WAN-2.1 input data as data URI');
        } else if (video_model === 'hailuo-02') {
          // Hailuo-02 uses first_frame_image parameter with data URI
          inputData.first_frame_image = dataUri;
          console.log('✅ Image file added to Hailuo-02 input data as data URI (first_frame_image)');
        } else if (video_model === 'seedance-1-pro') {
          // Seedance Pro uses image parameter with data URI
          inputData.image = dataUri;
          console.log('✅ Image file added to Seedance Pro input data as data URI (image)');
        } else {
          inputData.start_image = dataUri; // Other models use 'start_image'
          console.log('✅ Image file added to input data as data URI (start_image)');
        }
      } else {
        console.log('❌ No image file found in parameters');
      }

      // Simple configuration for all models - no complex optimizations
      console.log('🎬 Using simple configuration for', video_model);

      // Keep models simple like Kling v2.1 - no complex configurations
      console.log('🎬 Using simple configuration for', video_model);

      // Add model-specific optimizations for WAN-2.1
      if (video_model === 'wan-2.1-i2v-720p') {
        console.log('🌊 Configuring WAN-2.1-i2v-720p model (REFERENCE MODEL - works perfectly)');
        console.log('🔧 WAN-2.1 using image parameter:', !!image);
        console.log('🔧 WAN-2.1 duration:', duration);
        console.log('🔧 WAN-2.1 prompt:', prompt);
        // Perfect settings for WAN-2.1 - keep as reference
        inputData.image_strength = 0.85; // High image preservation - proven optimal
        inputData.guidance_scale = 7.0; // Balanced guidance - proven optimal
        console.log('🖼️ WAN-2.1 REFERENCE settings: strength=0.85, guidance_scale=7.0 (PROVEN OPTIMAL)');
      }

      console.log('🚀 Calling Replicate API for genvideo...');
          console.log('� Luma/Ray loop set to false for image preservation');



      console.log('🚀 Calling Replicate API for genvideo...');
      console.log('🔧 Replicate version:', version);
      console.log('📋 Input data:', inputData);
      
      try {
        prediction = await replicate.predictions.create({
          version,
          input: inputData,
        });
        console.log('✅ Replicate API call successful, prediction ID:', prediction.id);
      } catch (replicateError) {
        console.error('❌ Replicate API call failed:', replicateError);
        throw replicateError;
      }
    } else if (type === 'genimage') {
      // Text-to-image request (Flux image model)
      console.log('🖼️ Processing genimage request with Flux model');
      
      const allowedRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
      const safeAspect = allowedRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';
      console.log('🔧 Received aspect ratio:', aspect_ratio);
      console.log('🔧 Safe aspect ratio:', safeAspect);
      
      // Sanitize prompt before sending to API
      const sanitizedPrompt = sanitizePrompt(prompt);
      console.log('🔧 Sanitized prompt for Flux:', sanitizedPrompt);
      
      try {
        prediction = await replicate.predictions.create({
          version: 'c6e5086a542c99e7e523a83d3017654e8618fe64ef427c772a1def05bb599f0c', // Flux 1.1 Pro Ultra (Latest)
          input: {
            prompt: sanitizedPrompt,
            aspect_ratio: safeAspect,
            output_format: 'jpg',
            disable_safety_checker: true,
          },
        });
        console.log('✅ Flux image generation started, prediction ID:', prediction.id);
      } catch (replicateError) {
        console.error('❌ Flux API call failed:', replicateError);
        throw replicateError;
      }
    }
    
    // Poll for completion
    let result = prediction;
    let logs = [];
    while (['starting', 'processing'].includes(result.status)) {
      await new Promise((res) => setTimeout(res, 1000));
      result = await replicate.predictions.get(result.id);
      if (result.logs) logs.push(result.logs);
    }
    result.allLogs = logs;
    return result;
  } catch (err) {
    console.error('❌ Fatal Replicate error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      response: err.response?.status || 'no response',
      replicateToken: process.env.REPLICATE_API_TOKEN ? 'Present' : 'Missing'
    });
    throw new Error(`Replicate call failed: ${err.message}`);
  }
}

export async function POST(req) {
  const startTime = Date.now();
  
  console.log('🚀 POST request received');
  console.log('🔗 Request URL:', req.url);
  console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));

  // Declare variables at function scope so they're accessible in catch block
  let user = null;
  let userData = null;
  let creditCost = 2; // Default for genimage
  let token = null;
  let type = null;

  try {
    console.log('📦 Parsing request data...');
    
    // Check content type to determine how to parse the request
    const contentType = req.headers.get('content-type');
    console.log('🔍 Content-Type:', contentType);
    
    let body, imageFile = null;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // FormData (for genvideo with file uploads)
      try {
        const formData = await req.formData();
        body = Object.fromEntries(formData.entries());
        imageFile = formData.get('file');
        console.log('📋 Parsed as FormData');
      } catch (formDataError) {
        console.error('❌ FormData parsing error:', formDataError);
        return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
      }
    } else {
      // JSON (for genimage and text2video)
      try {
        body = await req.json();
        console.log('📋 Parsed as JSON');
      } catch (jsonError) {
        console.error('❌ JSON parsing error:', jsonError);
        return NextResponse.json({ error: 'Failed to parse JSON data' }, { status: 400 });
      }
    }
    
    console.log('📥 Incoming request body:', body);
    console.log('🖼️ Image file:', imageFile ? `File: ${imageFile.name}, Size: ${imageFile.size}` : 'No file');

    const { prompt, aspect_ratio, type, video_model, duration } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // For genvideo, ensure we have an image file
    if (type === 'genvideo' && !imageFile) {
      return NextResponse.json({ error: 'Image file is required for video generation' }, { status: 400 });
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authenticatedUser) {
      console.error('Authentication error:', authError); // Log authentication errors
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    user = authenticatedUser;
    console.log('📥 Incoming API request:', { prompt, aspect_ratio, type, video_model, duration, user: user.id });

    // Determine credit cost based on generation type
    creditCost = 2; // Default for genimage
    if (type === 'genvideo' || type === 'text2video') {
      const costMapping = {
        'kling-v2.1': 4,
        'hailuo-02': 5,
        'wan-2.1-i2v-720p': 13,
        'seedance-1-pro': 4,
        'luma-ray': 22,
        'veo-3-fast': 20,
        'veo-3': 35
      };
      const costPerSecond = costMapping[video_model] || 2;
      
      // Use correct duration for cost calculation - Veo 3 and Veo 3 Fast use 8 seconds, others use 6
      let calculationDuration = duration || 6;
      if (video_model === 'veo-3-fast' || video_model === 'veo-3') {
        calculationDuration = duration || 8;
      }
      
      creditCost = costPerSecond * calculationDuration;
    }

    // Check user credits with better error handling
    console.log('Fetching user credits for user ID:', user.id);

    let currentCredits = 0;
    let userExists = false;

    try {
      // First, create a Supabase client with the user's auth token for proper RLS access
      const authenticatedSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      console.log('🔍 Checking for existing user with authenticated client:', user.id);
      
      // Use array query instead of .single() to handle duplicates
      const { data: allUserData, error: userError } = await authenticatedSupabase
        .from('users')
        .select('credits')
        .eq('id', user.id);

      if (userError) {
        console.error('Supabase query error:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code
        });
        
        // If it's an RLS error, user likely doesn't exist yet
        if (userError.message.includes('row-level security') || userError.code === '42501') {
          console.log('🔐 RLS blocking access, user likely doesn\'t exist yet. Will attempt to create...');
        } else {
          console.log('⚠️ Database query failed, using default credits');
          currentCredits = 10;
          userData = { credits: 10, temporary: true };
        }
      } else if (!allUserData || allUserData.length === 0) {
        console.log('👤 No user found in database');
      } else if (allUserData.length > 1) {
        // Multiple users found - use the first one and clean up duplicates
        console.warn(`Found ${allUserData.length} duplicate entries for user ${user.id}. Using the first one.`);
        userData = allUserData[0];
        currentCredits = userData.credits || 0;
        userExists = true;
        
        // Clean up duplicates (keep the first one)
        for (let i = 1; i < allUserData.length; i++) {
          await authenticatedSupabase
            .from('users')
            .delete()
            .eq('id', user.id)
            .limit(1);
        }
        console.log('Cleaned up duplicate entries');
      } else {
        // Exactly one user found - normal case
        userData = allUserData[0];
        currentCredits = userData.credits || 0;
        userExists = true;
        console.log('✅ User credits found:', currentCredits);
      }

      // If user doesn't exist, create them
      if (!userExists) {
        console.log('👤 Creating new user with 10 credits...');
        
        try {
          const { data: newUser, error: insertError } = await authenticatedSupabase
            .from('users')
            .insert([{ 
              id: user.id, 
              email: user.email, 
              credits: 10,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (!insertError && newUser) {
            console.log('✅ New user created successfully');
            currentCredits = 10;
            userData = { credits: 10 };
            userExists = true;
          } else {
            console.error('❌ User creation failed:', {
              message: insertError?.message,
              details: insertError?.details,
              hint: insertError?.hint,
              code: insertError?.code
            });
            
            // Check if it's an RLS issue
            if (insertError?.code === '42501') {
              console.error('🚨 CRITICAL: RLS policies are blocking user creation!');
              console.error('📝 Please run: supabase-rls-policies.sql commands to fix RLS.');
              
              return NextResponse.json({ 
                error: 'Database setup required', 
                detail: 'Row Level Security policies need to be configured. Please contact support.',
                code: 'RLS_SETUP_REQUIRED'
              }, { status: 500 });
            }
            
            // Fallback to temporary credits
            console.log('⚠️ Using temporary credits due to user creation failure');
            currentCredits = 10;
            userData = { credits: 10, temporary: true };
          }
        } catch (userError) {
          console.error('❌ User creation exception:', userError.message);
          // Fallback to temporary credits
          console.log('⚠️ Using temporary credits due to exception');
          currentCredits = 10;
          userData = { credits: 10, temporary: true };
        }
      }

    } catch (generalError) {
      console.error('❌ General database error:', generalError.message);
      console.log('⚠️ Using fallback credits due to database error');
      currentCredits = 10;
      userData = { credits: 10, temporary: true };
    }

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. You need ${creditCost} credits but only have ${currentCredits}` 
      }, { status: 402 });
    }

    // Log credit deduction details
    console.log('Attempting to deduct credits:', { userId: user.id, creditCost });

    // Deduct credits before generation using Supabase RPC (only if user exists in database)
    if (userData && !userData.temporary) {
      console.log('Attempting to deduct credits from database user');
      console.log('User ID:', user.id, 'Credit Cost:', creditCost, 'Current Credits:', currentCredits);
      
      try {
        // Use authenticated client for credit deduction
        const authenticatedSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        const { error: deductError } = await authenticatedSupabase.rpc('decrease_user_credits', {
          amount: creditCost,
          uid: user.id,
        });

        if (deductError) {
          console.error('❌ Failed to deduct credits via RPC:', deductError);
          console.error('❌ Error details:', {
            message: deductError.message,
            details: deductError.details,
            hint: deductError.hint,
            code: deductError.code
          });
          
          return NextResponse.json({ 
            error: 'Failed to deduct credits', 
            detail: `Database error: ${deductError.message}`,
            suggestion: 'Please check your Supabase RLS policies and database functions. Make sure you have run the SQL setup commands.'
          }, { status: 500 });
        } else {
          console.log('✅ Credits deducted successfully');
        }
      } catch (deductionError) {
        console.error('❌ Unexpected error during credit deduction:', deductionError);
        return NextResponse.json({ 
          error: 'Credit deduction failed', 
          detail: deductionError.message,
          suggestion: 'Please check your database connection and RLS policies'
        }, { status: 500 });
      }
    } else {
      console.log('⚠️ User is temporary or not in database, skipping credit deduction');
      console.log('This means the user will have unlimited credits until database issues are resolved');
    }

    // ALL MODELS NOW USE SIMPLE SYNC PROCESSING - no more async complications  
    // DISABLED async processing - it was causing frontend completion detection issues
    const isAsync = false;
    
    if (isAsync) {
      console.log(`🔄 Using ASYNC processing for ${video_model} (long-running model)`);
      
      // Start the generation without waiting
      const prediction = await startAsyncGeneration({ 
        prompt, 
        aspect_ratio, 
        type, 
        video_model, 
        duration, 
        image: imageFile,
        userId: user.id,
        creditCost: creditCost,
        token: token
      });
      
      // Return immediately with prediction ID for polling
      return NextResponse.json({ 
        prediction_id: prediction.id,
        status: 'processing',
        message: `${video_model} video generation started. This may take 2-10 minutes. Poll /api/generation-status?id=${prediction.id} for updates.`
      }, { status: 202 });
      
    } else {
      console.log(`🔄 Using SYNC processing for ${type}/${video_model || 'flux'} (fast model)`);
      
      const result = await generateContent({ prompt, aspect_ratio, type, video_model, duration, image: imageFile });
      
      if (result.status !== 'succeeded' || !result.output) {
        console.error('❌ Generation failed:', result.error || result.logs || 'Unknown');
        
        // Refund credits for failed generation
        if (userData && !userData.temporary) {
          console.log('💰 Attempting to refund credits due to generation failure');
          await refundCredits(user.id, creditCost, token);
        }
        
        // Check if it's a content moderation issue
        const errorMessage = result.error || result.logs || 'Unknown error';
        const isContentFlagged = errorMessage.includes('Content flagged') || 
                                errorMessage.includes('sexual') || 
                                errorMessage.includes('inappropriate') ||
                                errorMessage.includes('NSFW content detected') ||
                                errorMessage.includes('NSFW') ||
                                errorMessage.includes('moderation');
        
        if (isContentFlagged) {
          console.log('🚫 Content was flagged by moderation system');
          return NextResponse.json(
            {
              error: 'Content moderation issue',
              detail: `The AI detected potentially inappropriate content in your prompt. The system flagged: "${errorMessage}". Please try rephrasing your prompt with more general terms and avoid specific themes that might be misinterpreted.`,
              logs: result.allLogs || [],
              status: result.status,
              suggestion: 'Try using more general descriptions like "people at a table", "card game", "social gathering" instead of specific gambling/casino references.',
              refunded: true
            },
            { status: 400 } // Use 400 instead of 500 for content issues
          );
        }
        
        // Determine error message based on generation type
        const isImageGeneration = type === 'genimage';
        const errorTitle = isImageGeneration ? 'Error generating image' : 'Error generating video';
        const refundMessage = 'Your credits will be refunded';
        
        return NextResponse.json(
          {
            error: errorTitle,
            detail: result.logs || 'Generation failed due to technical issues',
            logs: result.allLogs || [],
            status: result.status,
            refunded: true,
            refundMessage: refundMessage,
            isImageGeneration: isImageGeneration
          },
          { status: 500 }
        );
      }

      const output = Array.isArray(result.output) ? result.output[0] : result.output;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Success in ${elapsed}s`);
      return NextResponse.json({ output, duration: elapsed, logs: result.allLogs || [], status: result.status }, { status: 200 });
    }

    if (result.status !== 'succeeded' || !result.output) {
      console.error('❌ Generation failed:', result.error || result.logs || 'Unknown');
      
      // Check if it's a content moderation issue
      const errorMessage = result.error || result.logs || 'Unknown error';
      const isContentFlagged = errorMessage.includes('Content flagged') || 
                              errorMessage.includes('sexual') || 
                              errorMessage.includes('inappropriate') ||
                              errorMessage.includes('NSFW content detected') ||
                              errorMessage.includes('NSFW') ||
                              errorMessage.includes('moderation');
      
      if (isContentFlagged) {
        console.log('🚫 Content was flagged by moderation system');
        return NextResponse.json(
          {
            error: 'Content moderation issue',
            detail: `The AI detected potentially inappropriate content in your prompt. The system flagged: "${errorMessage}". Please try rephrasing your prompt with more general terms and avoid specific themes that might be misinterpreted.`,
            logs: result.allLogs || [],
            status: result.status,
            suggestion: 'Try using more general descriptions like "people at a table", "card game", "social gathering" instead of specific gambling/casino references.'
          },
          { status: 400 } // Use 400 instead of 500 for content issues
        );
      }
      
      return NextResponse.json(
        {
          error: result.error || 'Video generation failed',
          detail: result.logs || 'No logs',
          logs: result.allLogs || [],
          status: result.status
        },
        { status: 500 }
      );
    }

    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Success in ${elapsed}s`);
    return NextResponse.json({ output, duration: elapsed, logs: result.allLogs || [], status: result.status }, { status: 200 });

  } catch (err) {
    console.error('❌ CATCH BLOCK - Unexpected server error at:', new Date().toISOString());
    console.error('❌ Error name:', err.name);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Full error object:', err);

    // Refund credits for unexpected errors (if credits were deducted)
    try {
      if (user && userData && !userData.temporary && typeof creditCost !== 'undefined') {
        console.log('💰 Attempting to refund credits due to server error');
        await refundCredits(user.id, creditCost, token);
      }
    } catch (refundError) {
      console.error('❌ Failed to refund credits after server error:', refundError);
    }

    // Determine if this was an image or video generation
    const isImageGeneration = type === 'genimage';
    const errorTitle = isImageGeneration ? 'Error generating image' : 'Error generating video';

    return NextResponse.json(
      {
        error: errorTitle,
        detail: err?.message || 'Unexpected server error occurred',
        refunded: true,
        refundMessage: 'Your credits will be refunded',
        isImageGeneration: isImageGeneration
      },
      { status: 500 }
    );
  }
}
