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
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const output = await replicate.run(
      'black-forest-labs/flux-1.1-pro-ultra:acf88923dc8e891b46a6a22006ddcb99826e5318de95ba3adf9968c7f6a40eaf',
      {
        input: {
          prompt,
          width: 512,
          height: 768,
          guidance_scale: 7,
          num_inference_steps: 30
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


