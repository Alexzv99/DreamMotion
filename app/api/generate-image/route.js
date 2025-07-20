import Replicate from 'replicate';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log('🔑 Replicate API Token Status:', process.env.REPLICATE_API_TOKEN ? 'Present' : 'Missing');
console.log('🔑 Token length:', process.env.REPLICATE_API_TOKEN?.length || 0);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Removed hardcoded fallback value
);

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
    
    let prediction;
    if (type === 'text2video') {
      // Text-to-video models
      let version;
      if (video_model === 'hailuo-02') {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Hailuo 02
      } else if (video_model === 'veo-3-fast') {
        version = 'd7aca9396ea28c4ef46700a43cb59546c9948396eb571ca083df8344391335b3'; // Veo 3 Fast
      } else if (video_model === 'veo-3') {
        version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3
      } else {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Default to Hailuo 02
      }
      prediction = await replicate.predictions.create({
        version,
        input: {
          prompt,
          aspect_ratio,
          duration: duration || 6,
        },
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
        version = 'd7aca9396ea28c4ef46700a43cb59546c9948396eb571ca083df8344391335b3'; // Veo 3 Fast
      } else if (video_model === 'veo-3') {
        version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3
      } else if (video_model === 'wan-2.1-i2v-720p') {
        version = '9736bda14044031883500101f4b3814f6e9526e019036da0b42cced4168c6007'; // WAN-2.1-i2v-720p (user provided)
      } else if (video_model === 'kling-v2.1') {
        version = '1a3f2d7321a5f38d932d85e3ee8e286ba278990f66293f1fac2d26c2b3798b8d'; // Kling v2.1
      } else if (video_model === 'seedance-1-pro') {
        version = '567d056ac32cf4966a0a6ce60b043408e2a81493e7b0c6579af80aca19d1c070'; // Seedance Pro
      } else if (video_model === 'luma-ray') {
        version = '8af469846e8ba045167fb3f1570af72f6545901b2d815b851aa36e5c33b5e1e5'; // Luma/Ray
      } else {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Default to Hailuo 02
      }

      console.log('🆔 Using version ID:', version);

      // For genvideo, we need to include the image file
      const inputData = {
        prompt,
        duration: parseInt(duration) || 6, // Convert to integer
      };

      // Add image file if it exists - use 'start_image' for most models
      if (image) {
        if (video_model === 'wan-2.1-i2v-720p') {
          inputData.image = image; // WAN-2.1 uses 'image' instead of 'start_image'
          console.log('✅ Image file added to WAN-2.1 input data as image');
        } else if (video_model === 'luma-ray') {
          inputData.start_image = image; // Luma/Ray uses 'start_image'
          console.log('✅ Image file added to Luma/Ray input data as start_image');
        } else if (video_model === 'hailuo-02') {
          inputData.start_image = image; // Hailuo-02 uses 'start_image'
          console.log('✅ Image file added to Hailuo-02 input data as start_image');
        } else {
          inputData.start_image = image; // Other models use 'start_image'
          console.log('✅ Image file added to input data as start_image');
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
        console.log('🚀 Configuring Hailuo-02 model');
        console.log('🔧 Hailuo-02 using image parameter:', !!image);
        console.log('🔧 Hailuo-02 duration:', duration);
        console.log('🔧 Hailuo-02 prompt:', prompt);
        // Add image preservation settings for Hailuo-02
        inputData.image_strength = 0.9; // High image preservation
        inputData.cfg_scale = 7.5; // Balanced guidance
        console.log('🖼️ Hailuo-02 image preservation: strength=0.9, cfg_scale=7.5');
      }

      if (video_model === 'seedance-1-pro') {
        console.log('🎭 Configuring Seedance Pro model');
        // Add image preservation settings for Seedance Pro
        inputData.image_strength = 0.85; // High image preservation
        inputData.guidance_scale = 7.0; // Balanced guidance
        console.log('🖼️ Seedance Pro image preservation: strength=0.85, guidance_scale=7.0');
      }

      // Add model-specific optimizations for WAN-2.1
      if (video_model === 'wan-2.1-i2v-720p') {
        console.log('🌊 Configuring WAN-2.1-i2v-720p model');
        console.log('🔧 WAN-2.1 using image parameter:', !!image);
        console.log('🔧 WAN-2.1 duration:', duration);
        console.log('🔧 WAN-2.1 prompt:', prompt);
        // Add image preservation settings for WAN-2.1
        inputData.image_strength = 0.85; // High image preservation
        inputData.guidance_scale = 7.0; // Balanced guidance
        console.log('🖼️ WAN-2.1 image preservation: strength=0.85, guidance_scale=7.0');
      }

      // Add model-specific optimizations for Luma/Ray
      if (video_model === 'luma-ray') {
        console.log('🌟 Configuring Luma/Ray model');
        console.log('🔧 Luma/Ray using image parameter:', !!image);
        console.log('🔧 Luma/Ray duration:', duration);
        console.log('🔧 Luma/Ray prompt:', prompt);
        // Add image preservation settings for Luma/Ray
        inputData.image_strength = 0.9; // High image preservation
        inputData.guidance_scale = 7.0; // Balanced guidance
        console.log('🖼️ Luma/Ray image preservation: strength=0.9, guidance_scale=7.0');
      }

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
    } else {
      // Default: Flux image model
      const allowedRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
      const safeAspect = allowedRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';
      console.log('Received aspect ratio:', aspect_ratio);
      prediction = await replicate.predictions.create({
        version: 'c6e5086a542c99e7e523a83d3017654e8618fe64ef427c772a1def05bb599f0c', // Flux 1.1 Pro Ultra (Latest)
        input: {
          prompt,
          aspect_ratio: safeAspect,
          output_format: 'jpg',
          disable_safety_checker: true,
        },
      });
    }
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
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
      imageFile = formData.get('file');
      console.log('📋 Parsed as FormData');
    } else {
      // JSON (for genimage and text2video)
      body = await req.json();
      console.log('📋 Parsed as JSON');
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
        'wan-2.1-i2v-720p': 9,
        'seedance-1-pro': 4,
        'luma-ray': 15,
        'veo-3-fast': 15,
        'veo-3': 25
      };
      const costPerSecond = costMapping[video_model] || 2;
      creditCost = costPerSecond * (duration || 6);
    }

    // Check user credits
    // Log user ID and query details for debugging
    console.log('Fetching user credits for user ID:', user.id);

    // Update query to use 'id' instead of 'user_id'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id) // Use 'id' column
      .single();

    // Log query result and errors for debugging
    console.log('Fetching user credits for user ID:', user.id);
    if (userError) {
      console.error('Supabase query error:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
      });
    } else if (!userData) {
      console.error('No user data found for user ID:', user.id);
    }

    let currentCredits = 0;

    if (userError || !userData) {
      console.error('Failed to fetch user credits:', userError);
      return NextResponse.json({
        error: 'Failed to fetch user credits',
        detail: userError?.message || 'No user data found',
        status: 500, // Include status for clarity
      }, { status: 500 });
    }

    currentCredits = userData.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. You need ${creditCost} credits but only have ${currentCredits}` 
      }, { status: 402 });
    }

    // Log credit deduction details
    console.log('Attempting to deduct credits:', { userId: user.id, creditCost });

    // Deduct credits before generation using Supabase RPC
    const { error: deductError } = await supabase.rpc('decrease_user_credits', {
      amount: creditCost, // Deduct the calculated credit cost
      uid: user.id, // Use the user's UUID
    });

    if (deductError) {
      console.error('Failed to deduct credits via RPC:', deductError);
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    const result = await generateContent({ prompt, aspect_ratio, type, video_model, duration, image: imageFile });

    if (result.status !== 'succeeded' || !result.output) {
      console.error('❌ Generation failed:', result.error || result.logs || 'Unknown');
      
      // Check if it's a content moderation issue
      const errorMessage = result.error || result.logs || 'Unknown error';
      const isContentFlagged = errorMessage.includes('Content flagged') || errorMessage.includes('sexual') || errorMessage.includes('inappropriate');
      
      if (isContentFlagged) {
        console.log('🚫 Content was flagged by moderation system');
        return NextResponse.json(
          {
            error: 'Content moderation issue',
            detail: `The AI detected potentially inappropriate content in your request: "${errorMessage}". Please try rephrasing your prompt or using a different image. This may be a false positive.`,
            logs: result.allLogs || [],
            status: result.status,
            suggestion: 'Try rephrasing your prompt to be more specific and avoid ambiguous terms'
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

    return NextResponse.json(
      {
        error: 'Server error',
        detail: err?.message || 'Unknown',
      },
      { status: 500 }
    );
  }
}
