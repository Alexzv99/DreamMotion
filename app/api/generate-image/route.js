import Replicate from 'replicate';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sragjoqgnpikknnclppv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
);

async function generateImage({ prompt, aspect_ratio }) {
  try {
    // Accept type, video_model, duration for video requests
    const { type = 'genimage', video_model, duration } = arguments[0] || {};
    let prediction;
        if (type === 'text2video' || type === 'genvideo') {
      // Use correct video model version for text2video
      let version;
      if (video_model === 'hailuo-02') {
        version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Hailuo 02
      } else if (video_model === 'veo-3-fast') {
        version = 'd7aca9396ea28c4ef46700a43cb59546c9948396eb571ca083df8344391335b3'; // Veo 3 Fast
      } else if (video_model === 'veo-3') {
        version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3
      } else {
        version = 'b7b7e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2'; // Default to Hailuo 02
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
            let version;
            if (video_model === 'hailuo-02') {
                version = '0d9f5f2f92cfd480087dfe7aa91eadbc1d48fbb1a0260379e2b30ca739fb20bd'; // Hailuo 02
            } else if (video_model === 'veo-3-fast') {
                version = 'd7aca9396ea28c4ef46700a43cb59546c9948396eb571ca083df8344391335b3'; // Veo 3 Fast
            } else if (video_model === 'veo-3') {
                version = '590348ebd4cb656f3fc5b9270c4c19fb2abc5d1ae6101f7874413a3ec545260d'; // Veo 3
            } else if (video_model === 'wan-2.1-i2v-720p') {
                version = '0881fa8c32dcef98861684ad61a062c547d19a15f20bc923ac29996c82d10337'; // New genvideo model
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
    } else {
      // Default: Flux image model
      const allowedRatios = [
        '21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16', '9:21'
      ];
      const safeAspect = allowedRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';
      prediction = await replicate.predictions.create({
        version: 'c6e5086a542c99e7e523a83d3017654e8618fe64ef427c772a1def05bb599f0c', // Flux 1.1 Pro Ultra (Latest)
        input: {
          prompt,
          aspect_ratio: safeAspect,
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
    });
    throw new Error(`Replicate call failed: ${err.message}`);
  }
}

export async function POST(req) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { prompt, aspect_ratio, type, video_model, duration } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    let currentCredits = 0;
    
    if (userError) {
      // If user doesn't exist, create them with initial credits
      if (userError.code === 'PGRST116' || userError.message?.includes('No rows found')) {
        console.log('User not found, creating new user with 10 credits...');
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ user_id: user.id, email: user.email, credits: 10 }]);
        
        if (!insertError) {
          console.log('New user created with 10 credits');
          currentCredits = 10;
        } else {
          console.error('Error creating user:', insertError);
          return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
        }
      } else {
        console.error('Database error fetching user:', userError);
        return NextResponse.json({ error: 'Failed to fetch user credits' }, { status: 500 });
      }
    } else {
      currentCredits = userData?.credits || 0;
    }

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. You need ${creditCost} credits but only have ${currentCredits}` 
      }, { status: 402 });
    }

    console.log('📥 API call received:', { prompt, type, video_model, duration, aspect_ratio, user: user.id, creditCost });

    // Deduct credits before generation
    const { error: deductError } = await supabase
      .from('users')
      .update({ credits: currentCredits - creditCost })
      .eq('user_id', user.id);

    if (deductError) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    const result = await generateImage({ prompt, aspect_ratio, type, video_model, duration });

    if (result.status !== 'succeeded' || !result.output) {
      console.error('❌ Generation failed:', result.error || result.logs || 'Unknown');
      return NextResponse.json(
        {
          error: result.error || 'Image generation failed',
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
    console.error('❌ Unexpected server error:', err);

    return NextResponse.json(
      {
        error: 'Server error',
        detail: err?.message || 'Unknown',
      },
      { status: 500 }
    );
  }
}
