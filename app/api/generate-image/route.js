import Replicate from 'replicate';
import { NextResponse } from 'next/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
        version: '352185dbc99e9dd708b78b4e6870e3ca49d00dc6451a32fc6dd57968194fae5a', // Flux 1.1 Pro Ultra
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

    console.log('📥 API call received:', { prompt, type, video_model, duration, aspect_ratio });

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
