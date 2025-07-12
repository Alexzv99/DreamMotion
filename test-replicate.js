import Replicate from 'replicate';

const replicate = new Replicate({
  auth: 'r8_JDS7v3ewPH98ZpepNOgKO45GtWY5rfS3nkeSl', // hardcoded for test
});

async function test() {
  try {
    const result = await replicate.predictions.create({
      version: 'pvz6pfs219rge0ck0byvzvs5k0',
      input: {
        prompt: 'a dragon flying over a medieval castle at sunset',
        aspect_ratio: '16:9',
        output_format: 'jpg',
        safety_tolerance: 2,
        image_prompt_strength: 0.1,
        raw: false
      }
    });

    console.log(result);
  } catch (err) {
    console.error('❌ REPLICATE ERROR:', err);
  }
}

test();

