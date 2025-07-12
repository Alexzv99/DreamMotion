
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function GenerateToolClient() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'genimage';
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const aspectOptions = {
    'wan-2.1-i2v-720p': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '1:1', label: '1:1' }
    ],
    'seedance-1-pro': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '1:1', label: '1:1' }
    ],
    'luma-ray-2-540p': [
      { value: '16:9', label: '16:9 (Landscape)' },
      { value: '4:3', label: '4:3' },
      { value: '1:1', label: '1:1 (Square)' },
      { value: '3:4', label: '3:4 (Portrait)' },
      { value: '9:16', label: '9:16 (Vertical)' },
      { value: '9:21', label: '9:21' },
      { value: '21:9', label: '21:9' }
    ],
    'hailuo': [],
    'hailuo-v2': [],
    'veo': [
      { value: '16:9', label: '16:9' }
    ]
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null);
  const [videoModel, setVideoModel] = useState('hailuo');
  const videoModels = [
    { name: 'WAN 2.1 HD (Image to Video)', value: 'wan-2.1-i2v-720p', info: '🌀 wavespeedai / wan-2.1-i2v-720p — 5s or 10s. Efficient and fast.' },
    { name: 'Hailuo Live (Fast Animation)', value: 'hailuo', info: '🎥 minimax / video-01 (Hailuo) — 6s default, sometimes 10s.' },
    { name: 'Seedance Pro (HD 1080p)', value: 'seedance-1-pro', info: '🌊 bytedance / seedance-1-pro — 5s or 10s, 480p or 1080p.' },
    { name: 'Luma Ray 2 (Lite Quality)', value: 'luma-ray-2-540p', info: '💡 luma / ray (Dream Machine) — 4–8s typical.' }
  ];

  const validRatios = ['1:1', '3:4', '16:9', '9:16'];

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const tools = {
    image2video: {
      title: '🖼️ Image to Video',
      desc: 'Upload an image and animate it with cinematic motion.',
      note: 'NSFW generation is allowed',
      credits: '30 credits / second',
      inputType: 'file',
      bg: '/background-1.png'
    },
    genvideo: {
      title: '🎞️ Generate Video',
      desc: 'Transform images into cinematic motion.',
      note: '',
      credits: '20 credits / second',
      inputType: 'file',
      bg: '/background-2.png'
    },
    text2video: {
      title: '📝 Text to Video',
      desc: 'Describe a scene and generate cinematic motion.',
      note: '',
      credits: '2 credits / second',
      inputType: 'text',
      bg: '/background-3.png'
    },
    genimage: {
      title: '🖌️ Generate Image',
      desc: 'Create stunning images from your prompt using our text-to-image tool.',
      note: '',
      credits: '1 credit per image',
      inputType: 'text',
      bg: '/background-4.png'
    },
    needhelp: {
      title: '❓ Need Help?',
      desc: 'If you’re stuck or have questions, we’re here to assist you.',
      note: '',
      credits: 'Click below to contact support.',
      inputType: 'none',
      bg: '/background-5.png'
    }
  };

  const tool = tools[type];

  const handleGenerate = async () => {
    if (!prompt) return alert('Please enter a prompt.');
    // ...existing code for generation logic...
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-image.webp';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download image.');
      console.error('Download error:', err);
    }
  };

  if (!tool) {
    return (
      <main style={{ textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#c00', background: '#fff' }}>
        Sorry, the selected tool is not available.<br />
        Please check your URL or select a valid tool.
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundImage: `url(${tool.bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: '40px',
      position: 'relative',
      color: '#000'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', background: 'rgba(255,255,255,0.85)', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: 32 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 8 }}>{tool.title}</h1>
        <div style={{ fontSize: '1.1rem', marginBottom: 16 }}>{tool.desc}</div>
        {tool.note && <div style={{ color: '#0070f3', fontWeight: 500, marginBottom: 8 }}>{tool.note}</div>}
        <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: 16 }}>Credits: <b>{tool.credits}</b></div>

        {/* Model selection for video tools */}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="videoModel" style={{ fontWeight: 500 }}>Model:</label>
            <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ marginLeft: 12, padding: '6px 12px', borderRadius: 8 }}>
              {videoModels.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>{videoModels.find(m => m.value === videoModel)?.info}</div>
          </div>
        )}

        {/* Aspect ratio selection */}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && aspectOptions[videoModel]?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {aspectOptions[videoModel].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Duration slider for video models */}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="duration" style={{ fontWeight: 500 }}>Duration (seconds):</label>
            <input
              id="duration"
              type="range"
              min={videoModel === 'wan-2.1-i2v-720p' ? 5 : 4}
              max={videoModel === 'wan-2.1-i2v-720p' ? 10 : 10}
              step={videoModel === 'wan-2.1-i2v-720p' ? 5 : 1}
              value={duration || (videoModel === 'wan-2.1-i2v-720p' ? 5 : 6)}
              onChange={e => setDuration(Number(e.target.value))}
              style={{ marginLeft: 12, width: 180 }}
            />
            <span style={{ marginLeft: 12, fontWeight: 500 }}>{duration || (videoModel === 'wan-2.1-i2v-720p' ? 5 : 6)}s</span>
          </div>
        )}

        {/* Prompt input */}
        {(tool.inputType === 'text') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="prompt" style={{ fontWeight: 500 }}>Prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
              placeholder="Describe your scene or image..."
            />
          </div>
        )}

        {/* File upload input */}
        {(tool.inputType === 'file') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="file" style={{ fontWeight: 500 }}>Upload Image:</label>
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={e => {
                setFile(e.target.files[0]);
                setError('');
              }}
              style={{ marginLeft: 12 }}
            />
            {file && (
              <div style={{ marginTop: 10 }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && <div style={{ color: '#c00', fontWeight: 500, marginBottom: 12 }}>{error}</div>}

        {/* Loading spinner */}
        {loading && <div style={{ marginBottom: 12 }}><span>Generating...</span></div>}

        {/* Generate button */}
        {(tool.inputType !== 'none') && (
          <Button onClick={handleGenerate} style={{ fontSize: '1.1rem', padding: '10px 32px', borderRadius: 12, background: '#0070f3', color: '#fff', fontWeight: 600, marginTop: 8 }}>
            Generate
          </Button>
        )}

        {/* Preview and download */}
        {previewUrl && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ marginBottom: 10 }}>
              <img src={previewUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }} />
            </div>
            <Button onClick={handleDownload} style={{ fontSize: '1rem', padding: '8px 24px', borderRadius: 10, background: '#22c55e', color: '#fff', fontWeight: 500 }}>
              Download
            </Button>
          </div>
        )}

        {/* Help tool */}
        {type === 'needhelp' && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button onClick={() => router.push('/contact')} style={{ fontSize: '1.1rem', padding: '10px 32px', borderRadius: 12, background: '#0070f3', color: '#fff', fontWeight: 600 }}>
              Contact Support
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}