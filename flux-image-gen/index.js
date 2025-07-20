import express from 'express';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate-image', async (req, res) => {
  const { prompt, aspect_ratio } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Define aspect ratio dimensions
  const aspectRatios = {
    '1:1': { width: 1024, height: 1024 },
    '3:4': { width: 768, height: 1024 },
    '4:3': { width: 1024, height: 768 },
    '16:9': { width: 1024, height: 576 },
    '9:16': { width: 576, height: 1024 }
  };

  const dimensions = aspectRatios[aspect_ratio] || aspectRatios['1:1'];

  try {
    // Deduct credits before generating the image
    const userId = req.body.Id; // Changed from user_id to Id
    const deductCreditsResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/credits`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Id: userId, amount: 1 }), // Changed key from user_id to Id
    });

    if (!deductCreditsResponse.ok) {
      const error = await deductCreditsResponse.json();
      return res.status(400).json({ error: error.message || 'Failed to deduct credits' });
    }

    // Proceed with image generation
    const output = await replicate.run(
      'black-forest-labs/flux-1.1-pro-ultra:4f4ecf27427f34c3a3d9b8e3c648e3c5c7f7fd2f509f1173cdd24c38b02b8354',
      {
        input: {
          prompt,
          width: dimensions.width,
          height: dimensions.height,
          guidance_scale: 3.5,
          num_inference_steps: 28
        }
      }
    );

    res.json({ output });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: 'Generation failed' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


