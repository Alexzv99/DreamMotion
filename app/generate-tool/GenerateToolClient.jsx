'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function GenerateToolClient() {
  const [generationTime, setGenerationTime] = useState(null);
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'genimage';
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const aspectOptions = {
    'hailuo-02': [
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '4:3', label: '4:3' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' }
    ],
    'veo-3-fast': [
      { value: '16:9', label: '16:9' }
    ],
    'veo-3': [
      { value: '16:9', label: '16:9' }
    ]
  };
  const [loading, setLoading] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(0);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null);
  const [videoModel, setVideoModel] = useState('hailuo-02');
  const genvideoModels = [
    { name: 'Hailuo 02 (Minimax)', value: 'hailuo-02', info: '🎥 minimax/hailuo-02 — 6-10s cinematic video.' },
    { name: 'WAN 2.1 I2V 720p (WavespeedAI)', value: 'wan-2.1-i2v-720p', info: '🌊 wavespeedai/wan-2.1-i2v-720p cinematic video.' },
    { name: 'Kling v2.1 (Kwaivgi)', value: 'kling-v2.1', info: '🦾 kwaivgi/kling-v2.1 cinematic video.' },
    { name: 'Seedance 1 Pro (Bytedance)', value: 'seedance-1-pro', info: '🌊 bytedance/seedance-1-pro cinematic video.' },
    { name: 'Ray (Luma)', value: 'ray', info: '🌟 luma/ray cinematic video.' }
  ];
  const text2videoModels = [
    { name: 'Hailuo 02 (Minimax)', value: 'hailuo-02', info: '🎥 minimax/hailuo-02 — 6-10s cinematic video.' },
    { name: 'Veo 3 Fast (Google)', value: 'veo-3-fast', info: '🚀 Google / Veo 3 Fast — 16:9 cinematic video.' },
    { name: 'Veo 3 (Google)', value: 'veo-3', info: '🎬 Google / Veo 3 — 16:9 cinematic video.' }
  ];
  const videoModels = [
    { name: 'Hailuo 02 (Minimax)', value: 'hailuo-02', info: '🎥 minimax/hailuo-02 — 6-10s cinematic video.' },
    { name: 'WAN 2.1 I2V 720p (WavespeedAI)', value: 'wan-2.1-i2v-720p', info: '🌊 wavespeedai/wan-2.1-i2v-720p cinematic video.' },
    { name: 'Kling v2.1 (Kwaivgi)', value: 'kling-v2.1', info: '🦾 kwaivgi/kling-v2.1 cinematic video.' },
    { name: 'Seedance 1 Pro (Bytedance)', value: 'seedance-1-pro', info: '🌊 bytedance/seedance-1-pro cinematic video.' },
    { name: 'Ray (Luma)', value: 'ray', info: '🌟 luma/ray cinematic video.' }
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
      credits: '2 credits / second',
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
      desc: 'Create stunning images from your prompt using Flux model only.',
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
  let toolCredits = tool ? tool.credits : '';
  if (tool && type === 'genvideo') {
    toolCredits = '2 credits / second';
  }
  if (tool && type === 'image2video') {
    if (videoModel === 'veo-3-fast') {
      toolCredits = '5 credits / second';
    } else if (videoModel === 'veo-3') {
      toolCredits = '20 credits / second';
    }
  }

  const handleGenerate = async () => {
    if (!prompt) return alert('Please enter a prompt.');
    setLoading(true);
    setError('');
    setPreviewUrl(null);
    setGenerationTime(null);
    setLoadingMinutes(0);
    const start = Date.now();
    let timer;
    if (type === 'text2video' || type === 'genvideo' || type === 'image2video') {
      timer = setInterval(() => {
        setLoadingMinutes(prev => prev + 1);
      }, 60000);
    }
    try {
      let body = { prompt };
      // Always send 'type' in the request body
      body.type = type;
      if (type === 'image2video' || type === 'genvideo' || type === 'text2video') {
        body.video_model = videoModel;
        body.aspect_ratio = aspectRatio;
        if (videoModel === 'hailuo-02') {
          body.duration = duration || 6;
        } else if (videoModel === 'kling-v2.1' || videoModel === 'seedance-1-pro' || videoModel === 'ray' || videoModel === 'wan-2.1-i2v-720p') {
          body.duration = 8; // Default duration for Kling v2.1, Seedance 1 Pro, Ray, and WAN 2.1 I2V 720p
        }
      } else if (type === 'genimage') {
        body.aspect_ratio = aspectRatio;
      }
      // Remove video_model if type is genimage
      if (type === 'genimage' && 'video_model' in body) {
        delete body.video_model;
      }
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to generate image');
      const data = await res.json();
      if (!data?.output) throw new Error('No image returned');
      setPreviewUrl(data.output);
      if (data.duration) {
        setGenerationTime(data.duration);
      } else {
        setGenerationTime(((Date.now() - start) / 1000).toFixed(2));
      }
    } catch (err) {
      setError(err.message || 'Error generating image');
    }
    if (timer) clearInterval(timer);
    setLoading(false);
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
      backgroundImage: 'url("/background-2.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 0
      }} />

      <button
        onClick={() => router.push('/dashboard')}
        style={{
          position: 'fixed',
          top: 24,
          left: 32,
          background: '#fff',
          color: '#222',
          border: '1.5px solid #222',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '1rem',
          padding: '7px 18px',
          cursor: 'pointer',
          boxShadow: '0 1px 6px rgba(60,60,60,0.08)',
          zIndex: 100
        }}
      >
        ← Back
      </button>
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1200,
        margin: '40px auto',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        gap: 0,
        minHeight: 520,
        overflow: 'hidden'
      }}>
        {/* Controls Panel */}
        <div style={{
          flex: 1,
          padding: '40px 40px 40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minWidth: 340,
          maxWidth: 480,
        }}>
          <div style={{
            background: '#fff',
            color: '#222',
            borderRadius: '24px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            border: '2px solid',
            borderImage: 'linear-gradient(90deg, #c00 0%, #007bff 100%) 1',
            padding: '48px 40px',
            marginBottom: 20,
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: 'popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)'
          }}>
            <style>{`
              @keyframes popIn {
                0% { transform: scale(0.95); opacity: 0; }
                60% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
            <span style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: 8,
              color: '#111'
            }}>{tool.title}</span>
            <span style={{ fontSize: '1.18rem', fontWeight: 500, color: '#444', lineHeight: 1.5 }}>{tool.desc}</span>
          </div>
          {tool.note && <div style={{ color: '#0070f3', fontWeight: 500, marginBottom: 8 }}>{tool.note}</div>}
          <div style={{ fontSize: '0.95rem', color: '#c00', marginBottom: 16, fontWeight: 'bold' }}>Credits: <b>{toolCredits}</b></div>
          {/* Model selection for video tools */}
          {(type === 'genvideo') && (
            <div style={{
              marginBottom: 18,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 2px 12px rgba(30,30,40,0.10)',
              padding: '18px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontSize: '1.08rem',
              fontWeight: 600,
              color: '#222',
              border: '1.5px solid #e5e7eb'
            }}>
              <label htmlFor="videoModel" style={{ fontWeight: 600, marginRight: 8 }}>Model:</label>
              <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ padding: '7px 18px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f3f4f6', color: '#222', fontWeight: 600, fontSize: '1.05rem', boxShadow: '0 1px 6px rgba(60,60,60,0.08)' }}>
                {genvideoModels.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          {(type === 'text2video') && (
            <div style={{
              marginBottom: 18,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 2px 12px rgba(30,30,40,0.10)',
              padding: '18px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontSize: '1.08rem',
              fontWeight: 600,
              color: '#222',
              border: '1.5px solid #e5e7eb'
            }}>
              <label htmlFor="videoModel" style={{ fontWeight: 600, marginRight: 8 }}>Model:</label>
              <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ padding: '7px 18px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f3f4f6', color: '#222', fontWeight: 600, fontSize: '1.05rem', boxShadow: '0 1px 6px rgba(60,60,60,0.08)' }}>
                {text2videoModels.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

        {/* Aspect ratio selection for image models in genimage (Flux only) */}
        {type === 'genimage' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {/* Only show Flux model aspect ratios */}
              {['1:1', '3:4', '4:3', '16:9', '9:16'].map(ratio => (
                <label key={ratio} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="radio" name="aspectRatio" value={ratio} checked={aspectRatio === ratio} onChange={() => setAspectRatio(ratio)} />
                  {ratio}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 10, color: '#0070f3', fontWeight: 600 }}>
              Model: <b>Flux</b> (only)
            </div>
          </div>
        )}
        {/* Aspect ratio selection for video tools */}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && videoModel === 'hailuo-02' && (
          <div style={{
            marginBottom: 18,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(30,30,40,0.10)',
            padding: '18px 28px',
            fontSize: '1.08rem',
            fontWeight: 600,
            color: '#222',
            border: '1.5px solid #e5e7eb'
          }}>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
              {aspectOptions['hailuo-02'].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} style={{ accentColor: '#6366f1', marginRight: 4 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && (videoModel === 'hailuo-02' || videoModel === 'wan-2.1-i2v-720p' || videoModel === 'kling-v2.1' || videoModel === 'seedance-1-pro' || videoModel === 'ray') && (
          <div style={{
            marginBottom: 18,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(30,30,40,0.10)',
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: '1.08rem',
            fontWeight: 600,
            color: '#222',
            border: '1.5px solid #e5e7eb'
          }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', marginRight: 8 }}>
              {videoModel === 'hailuo-02' ? 'Hailuo 02 Model' : videoModel === 'wan-2.1-i2v-720p' ? 'WAN 2.1 I2V 720p Model' : videoModel === 'kling-v2.1' ? 'Kling v2.1 Model' : videoModel === 'seedance-1-pro' ? 'Seedance 1 Pro Model' : videoModel === 'ray' ? 'Ray Model' : ''}
            </span>
            <span>Aspect Ratio: <b>16:9</b> (fixed)</span>
            <span>Duration: <b>8s</b> (fixed)</span>
          </div>
        )}

        {/* Duration slider for video models */}
        {(type === 'image2video' || type === 'genvideo' || type === 'text2video') && videoModel === 'hailuo-02' && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="duration" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Duration (seconds)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[6, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDuration(val)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 18,
                    border: duration === val ? '2px solid #ff3b3b' : '2px solid #eee',
                    background: duration === val ? 'linear-gradient(90deg,#ffb347 0%,#ff3b3b 100%)' : '#f7f7f7',
                    color: duration === val ? '#fff' : '#222',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    boxShadow: duration === val ? '0 2px 8px rgba(255,59,59,0.10)' : 'none',
                    transition: 'all 0.2s',
                    outline: 'none',
                    borderBottom: duration === val ? '3px solid #ff3b3b' : 'none',
                  }}
                >
                  {val}s
                </button>
              ))}
            </div>
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
        {loading && (
          <div style={{ marginBottom: 12, color: '#444', fontWeight: 600, fontSize: '1.08rem' }}>
            {(type === 'text2video' || type === 'genvideo' || type === 'image2video') ? (() => {
              let totalEstimate = 5; // default 5 min for Hailuo 02
              if (videoModel === 'veo-3-fast' || videoModel === 'veo-3') totalEstimate = 8;
              const left = Math.max(totalEstimate - loadingMinutes, 0);
              return `Generating video... (~${left} minute${left !== 1 ? 's' : ''} left)`;
            })() : 'Generating image...'}
          </div>
        )}

        {/* Generate button */}
        {(tool.inputType !== 'none') && (
          <Button
            onClick={handleGenerate}
            className="creative-btn"
            style={{
              marginTop: 20,
              fontWeight: 'bold',
              fontSize: '1.18rem',
              padding: '16px 28px',
              borderRadius: '18px',
              letterSpacing: '0.04em',
              boxShadow: '0 0 18px 2px #222, 0 0 8px 2px #444',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(90deg, #222 0%, #444 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              textTransform: 'uppercase',
              transition: 'box-shadow 0.3s, transform 0.2s, background 0.3s',
            }}
          >
            <span style={{
              display: 'inline-block',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.2em',
              letterSpacing: '2px'
            }}>Generate</span>
            <style>{`
              .creative-btn {
                background: linear-gradient(90deg, #222 0%, #444 100%);
                color: #fff;
                border: none;
                font-family: Inter, Arial, sans-serif;
                font-weight: bold;
                transition: box-shadow 0.3s, transform 0.2s, background 0.3s;
                box-shadow: 0 0 18px 2px #222, 0 0 8px 2px #444;
                position: relative;
                overflow: hidden;
              }
              .creative-btn:hover {
                box-shadow: 0 0 32px 4px #222, 0 0 16px 4px #444;
                transform: scale(1.05);
                background: linear-gradient(90deg, #444 0%, #222 100%);
                filter: brightness(1.08);
              }
            `}</style>
          </Button>
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
        <div style={{
          flex: 1.2,
          padding: '40px 48px 40px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f1f1',
          minWidth: 340,
          maxWidth: 720,
          borderRadius: '12px',
          boxShadow: '0 0 12px rgba(0,0,0,0.05)'
        }}>
        {previewUrl ? (
          <>
            {(type === 'text2video' || type === 'genvideo' || type === 'image2video') ? (
              <video
                src={previewUrl}
                controls
                style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }}
              />
            ) : (
              <img src={previewUrl} alt="Generated Preview" style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }} />
            )}
            {generationTime && (
              <div style={{
                marginTop: 8,
                color: '#ff3b3b',
                fontWeight: 800,
                fontSize: '1.3rem',
                background: 'rgba(255,255,255,0.85)',
                borderRadius: 10,
                padding: '8px 18px',
                boxShadow: '0 2px 8px rgba(255,59,59,0.10)',
                display: 'inline-block'
              }}>
                {(() => {
                  const mins = (parseFloat(generationTime) / 60).toFixed(2);
                  return `⏱️ Generated in ${mins} minute${mins !== '1.00' ? 's' : ''}`;
                })()}
              </div>
            )}
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-block',
                fontSize: '1.08rem',
                padding: '12px 32px',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontWeight: 'bold',
                marginTop: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'background 0.2s',
              }}
            >Download</button>
          </>
        ) : (
          <div style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
            {loading
              ? (type === 'text2video' || type === 'genvideo' || type === 'image2video') ? (() => {
                  let totalEstimate = 5;
                  if (videoModel === 'veo-3-fast' || videoModel === 'veo-3') totalEstimate = 8;
                  const left = Math.max(totalEstimate - loadingMinutes, 0);
                  return `Generating video... (~${left} minute${left !== 1 ? 's' : ''} left)`;
                })() : 'Generating image...'
              : (type === 'text2video' || type === 'genvideo' || type === 'image2video')
                ? 'Your generated video will appear here.'
                : 'Your generated image will appear here.'}
          </div>
        )}
        </div>
      </div>
  </main>
  );
}