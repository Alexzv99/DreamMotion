import Replicate from 'replicate';
import { NextResponse } from 'next/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImage({ prompt, aspect_ratio, type, video_model }) {
  try {
    // Video model mapping
    const videoModelMap = {
      'wan-2.1-i2v-720p': '4bbda0138bdd8af0d6a6043f228b1aae70af56435b02fb8971a61a8f986c6f12',
      'hailuo': 'b3fd893b518666a710738c15185940144fce6987432a31768a8e0ffba7f3359b',
      'seedance-1-pro': '139f6d3911ff87298c1215d6b4ea77380878e461b5b3a452715017df95f7f872',
      'luma-ray-2-540p': 'ca1ec5aca83663230a3a442aa9b079de3b2c560fc707985c4cf15d40dfe6d293',
      'veo': '45146cdd5b1fda2b84a2c9dfeb153ed2bff2d3b8d598a6a88bc1bbf629d2298d' // Google Veo 3
    };
    if (type === 'text2video' || type === 'genvideo' || type === 'image2video') {
      const validRatios = ['1:1', '4:3', '16:9', '9:16'];
      const safeAspectRatio = validRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';
      let versionId = videoModelMap[video_model] || videoModelMap['hailuo'];
      let inputParams = {
        prompt,
        aspect_ratio: safeAspectRatio,
        motion: 'cinematic',
        duration: duration || 4
      };
      console.log(`⚙️ Sending to ${video_model} video model:`, { prompt, aspect_ratio });
      const prediction = await replicate.predictions.create({
        version: versionId,
        input: inputParams,
      });
      let result = prediction;
      while (['starting', 'processing'].includes(result.status)) {
        console.log(`⏳ Status: ${result.status}`);
        await new Promise((res) => setTimeout(res, 2000));
        result = await replicate.predictions.get(result.id);
      }
      return result;
    } else {
      console.log('⚙️ Sending to Flux 1.1 Pro Ultra (SFW only):', { prompt, aspect_ratio });
      const validRatios = ['1:1', '4:3', '16:9', '9:16'];
      const safeAspectRatio = validRatios.includes(aspect_ratio) ? aspect_ratio : '1:1';
      const prediction = await replicate.predictions.create({
        version: '352185dbc99e9dd708b78b4e6870e3ca49d00dc6451a32fc6dd57968194fae5a', // Flux 1.1 Pro Ultra
        input: {
          prompt,
          aspect_ratio: safeAspectRatio,
          negative_prompt: 'blurry, low quality, watermark, extra limbs, distorted, bad anatomy, bad hands, bad feet, text, logo',
          num_inference_steps: 50,
          guidance_scale: 10,
        },
      });
      let result = prediction;
      while (['starting', 'processing'].includes(result.status)) {
        console.log(`⏳ Status: ${result.status}`);
        await new Promise((res) => setTimeout(res, 2000));
        result = await replicate.predictions.get(result.id);
      }
      return result;
    }

    console.log('📨 Replicate initial response:', prediction);

    let result = prediction;
    while (['starting', 'processing'].includes(result.status)) {
      console.log(`⏳ Status: ${result.status}`);
      await new Promise((res) => setTimeout(res, 2000));
      result = await replicate.predictions.get(result.id);
    }

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
    const { prompt, aspect_ratio, type, video_model, duration: videoDuration } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('📥 API call received:', { prompt, aspect_ratio, type, video_model });

    const result = await generateImage({ prompt, aspect_ratio, type, video_model, duration: videoDuration });

    if (result.status !== 'succeeded' || !result.output) {
      console.error('❌ Generation failed:', result.error || result.logs || 'Unknown');
      return NextResponse.json(
        {
          error: result.error || 'Image generation failed',
          detail: result.logs || 'No logs',
        },
        { status: 500 }
      );
    }

    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Success in ${duration}s`);
    return NextResponse.json({ output, duration }, { status: 200 });

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
