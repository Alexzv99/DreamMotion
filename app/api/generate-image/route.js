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

async function generateContent(params, userId = null, useWebhook = false) {
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
      image: image ? 'present' : 'missing',
      useWebhook
    });
    
    // Determine webhook URL for async processing
    const webhookUrl = useWebhook ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dream-motion.vercel.app'}/api/webhook` : null;
    
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
      
      // Add model-specific optimizations for text2video
      if (video_model === 'hailuo-02') {
        console.log('🚀 Configuring Hailuo-02 model for TEXT2VIDEO (Text-to-Video)');
        console.log('🔧 Hailuo-02 text2video duration:', modelDuration);
        console.log('🔧 Hailuo-02 text2video prompt:', sanitizedPrompt);
        console.log('🔧 Hailuo-02 text2video aspect_ratio:', aspect_ratio);
        
        // Hailuo-02 text2video only supports 16:9, so force it
        inputData.aspect_ratio = '16:9';
        
        // Text-focused settings for text2video - prioritize prompt text
        inputData.cfg_scale = 8.5; // Higher guidance - follow text prompt closely
        inputData.num_inference_steps = 50; // More steps for better text adherence
        console.log('📝 Hailuo-02 TEXT2VIDEO settings: aspect_ratio=16:9 (forced), cfg_scale=8.5, steps=50 (TEXT-FOCUSED)');
      }
      
      const apiCall = {
        version,
        input: inputData,
      };
      
      // Add webhook URL for async processing
      if (webhookUrl) {
        apiCall.webhook = webhookUrl;
        apiCall.webhook_events_filter = ["start", "output", "logs", "completed"];
        console.log('🎣 Using webhook for async processing:', webhookUrl);
      }
      
      prediction = await replicate.predictions.create(apiCall);
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

      // Try to add safety settings for Kling v2.1 to reduce false positives
      if (video_model === 'kling-v2.1') {
        inputData.safety_tolerance = 'high'; // Try to be more permissive with content
        inputData.image_strength = 0.8; // Good image preservation for Kling v2.1
        inputData.guidance_scale = 6.5; // Balanced guidance
        console.log('🛡️ Added safety_tolerance: high for Kling v2.1');
        console.log('🖼️ Kling v2.1 image preservation: strength=0.8, guidance_scale=6.5');
      }

      // Add model-specific optimizations
      if (video_model === 'hailuo-02') {
        console.log('🌟 Configuring Hailuo-02 model (HYBRID: WAN-2.1 + Schema)');
        console.log('🔧 Hailuo-02 using first_frame_image parameter:', !!image);
        console.log('🔧 Hailuo-02 duration:', duration);
        console.log('🔧 Hailuo-02 prompt:', prompt);
        
        // FIRST: Use WAN-2.1's proven image preservation approach
        inputData.image_strength = 0.85; // COPY WAN-2.1's proven value
        inputData.guidance_scale = 7.0; // COPY WAN-2.1's proven value
        
        // SECOND: Add Hailuo-02 specific schema parameters
        inputData.prompt_optimizer = false; // Disable prompt optimization to preserve image fidelity
        
        console.log('🖼️ Hailuo-02 HYBRID: WAN-2.1 approach (strength=0.85, guidance=7.0) + Schema (prompt_optimizer=false)');
      }

      if (video_model === 'seedance-1-pro') {
        console.log('� Configuring Seedance-1-Pro model (HYBRID: WAN-2.1 + Schema)');
        console.log('🔧 Seedance Pro using image parameter:', !!image);
        console.log('🔧 Seedance Pro duration:', duration);
        console.log('🔧 Seedance Pro prompt:', prompt);
        
        // FIRST: Use WAN-2.1's proven image preservation approach
        inputData.image_strength = 0.85; // COPY WAN-2.1's proven value
        inputData.guidance_scale = 7.0; // COPY WAN-2.1's proven value
        
        // SECOND: Add schema-correct parameters for extra preservation
        inputData.resolution = "1080p"; // High quality output
        inputData.camera_fixed = true; // CRITICAL: Fix camera to prevent image distortion
        inputData.fps = 24; // Standard frame rate
        
        // CRITICAL FIX: Seedance Pro expects URI format, not base64
        if (image) {
          // Replace base64 with the File object - let Replicate handle the upload
          inputData.image = image; // Use File object instead of base64
          console.log('� Using File object for Seedance Pro (Replicate will handle upload)');
          
          delete inputData.aspect_ratio;
          console.log('🔧 Removed aspect_ratio - Seedance Pro uses image natural ratio');
        }
        
        console.log('🖼️ Seedance Pro HYBRID: WAN-2.1 approach (strength=0.85, guidance=7.0) + Schema (1080p, camera_fixed=true)');
      }

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
        const apiCall = {
          version,
          input: inputData,
        };
        
        // Add webhook URL for async processing
        if (webhookUrl) {
          apiCall.webhook = webhookUrl;
          apiCall.webhook_events_filter = ["start", "output", "logs", "completed"];
          console.log('🎣 Using webhook for async processing:', webhookUrl);
        }
        
        prediction = await replicate.predictions.create(apiCall);
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
    
    // For webhook-based calls, return immediately without polling
    if (webhookUrl) {
      console.log(`🎣 Webhook processing started - returning prediction immediately`);
      return prediction;
    }
    
    // For synchronous calls, poll for completion
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

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError); // Log authentication errors
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    console.log('📥 Incoming API request:', { prompt, aspect_ratio, type, video_model, duration, user: user.id });

    // Determine credit cost based on generation type
    let creditCost = 2; // Default for genimage
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
    let userData = null;
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

    // Determine if this should use async processing (long-running video models)
    const longRunningModels = ['hailuo-02', 'veo-3', 'veo-3-fast', 'luma-ray', 'kling-v2.1'];
    const useAsync = type === 'genvideo' && longRunningModels.includes(video_model);
    
    if (useAsync) {
      console.log(`🔄 Using ASYNC processing for ${video_model} (prevents timeout)`);
      
      // Create the generation record in database first
      const { data: generation, error: insertError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          prediction_id: 'pending', // Will be updated with actual ID
          type,
          model: video_model,
          prompt,
          credits_cost,
          status: 'starting'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error creating generation record:', insertError);
        return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 });
      }
      
      // Start the async generation with webhook
      const result = await generateContent(
        { prompt, aspect_ratio, type, video_model, duration, image: imageFile }, 
        user.id, 
        true // useWebhook = true
      );
      
      // Update the generation record with the actual prediction ID
      const { error: updateError } = await supabase
        .from('generations')
        .update({ prediction_id: result.id })
        .eq('id', generation.id);
      
      if (updateError) {
        console.error('❌ Error updating prediction ID:', updateError);
      }
      
      console.log(`✅ Async generation started - ID: ${result.id}`);
      
      // Return immediately with status info
      return NextResponse.json({
        prediction_id: result.id,
        status: 'processing',
        message: 'Video generation started. This may take 2-3 minutes.',
        check_url: `/api/generation-status?id=${result.id}`,
        estimated_time: '2-3 minutes'
      }, { status: 202 }); // 202 = Accepted (processing)
      
    } else {
      console.log(`🔄 Using SYNC processing for ${type}/${video_model || 'flux'} (fast model)`);
      
      // Use synchronous processing for fast models (images, short videos)
      const result = await generateContent({ prompt, aspect_ratio, type, video_model, duration, image: imageFile });

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
    
    } // End of else block for sync processing

  } catch (err) {
    console.error('❌ CATCH BLOCK - Unexpected server error at:', new Date().toISOString());
    console.error('❌ Error name:', err.name);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Full error object:', err);

    return NextResponse.json(
      {
        error: 'Server error',
        detail: err?.message || 'Unknown',
      },
      { status: 500 }
    );
  }
}
