'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function GenerateToolPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'genimage';
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  // Aspect ratio options by model
  const aspectOptions = {
    'wan-2.1-i2v-720p': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '1:1', label: '1:1' }
    ],
    'seedance-1-pro': [
      { value: '16:9', label: '16:9' },
      { value: '4:3', label: '4:3' },
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '9:16', label: '9:16' },
      { value: '9:21', label: '9:21' },
      { value: '21:9', label: '21:9' }
    ],
    'luma-ray-2-540p': [
      { value: '16:9', label: '16:9' },
      { value: '4:3', label: '4:3' },
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '9:16', label: '9:16' },
      { value: '9:21', label: '9:21' },
      { value: '21:9', label: '21:9' }
    ],
    'hailuo': [], // auto aspect
    'hailuo-v2': [], // auto aspect
    'veo': [
      { value: '16:9', label: '16:9' }
    ]
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null);
  const [videoModel, setVideoModel] = useState('hailuo');
  // Video models for selection
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

    const safeAspectRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';
    if (aspectRatio !== safeAspectRatio) {
      alert(`⚠️ Aspect ratio ${aspectRatio} is not supported. Falling back to 1:1.`);
      setAspectRatio('1:1');
    }

    try {
      setLoading(true);
      setError('');
      setDuration(null);

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: safeAspectRatio,
          output_format: 'webp',
          output_quality: 85,
          // safety_tolerance removed, NSFW not allowed
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Server error');
      if (!data?.output) throw new Error('No output returned from server');

      setPreviewUrl(data.output);
      if (data.duration) setDuration(data.duration);

    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.message || 'Something went wrong during generation.');
    } finally {
      setLoading(false);
    }
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

      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 2,
          backgroundColor: '#fff',
          color: '#000',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px 14px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <div style={{
        zIndex: 1,
        position: 'relative',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 0 12px rgba(0,0,0,0.3)',
        color: '#000',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Inter, Arial, sans-serif' }}>{tool.title}</h2>
        <p style={{ marginBottom: '8px', fontFamily: 'Inter, Arial, sans-serif' }}>{tool.desc}</p>
        {tool.note && <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '8px' }}>{tool.note}</p>}
        <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Inter, Arial, sans-serif' }}>
          {(type === 'genvideo' || type === 'image2video')
            ? (() => {
                const seconds = duration || 5;
                let perSecond = 2;
                if (videoModel === 'wan-2.1-i2v-720p') perSecond = 5;
                else if (videoModel === 'seedance-1-pro') perSecond = 6;
                else if (videoModel === 'hailuo') perSecond = 3;
                else if (videoModel === 'luma-ray-2-540p') perSecond = 2;
                return `${perSecond * seconds} credits (${seconds}s)`;
              })()
            : type === 'text2video'
            ? (() => {
                const seconds = duration || 5;
                let perSecond = 2;
                if (videoModel === 'veo') perSecond = 20;
                else if (videoModel === 'hailuo') perSecond = 2;
                return `${perSecond * seconds} credits (${seconds}s)`;
              })()
            : tool.credits}
        </p>

        {tool.inputType === 'text' && (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              backdropFilter: 'blur(12px)',
              border: '2px solid',
              borderImage: 'linear-gradient(90deg, #c00 0%, #007bff 100%) 1',
              padding: '32px 24px',
              marginBottom: '20px',
              transition: 'box-shadow 0.3s',
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
              <textarea
                rows={6}
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  resize: 'vertical',
                  fontSize: '1rem',
                  fontFamily: 'Inter, Arial, sans-serif',
                  background: 'rgba(255,255,255,0.25)',
                  color: '#222',
                  fontWeight: 'bold',
                  border: '1px solid #cccccc',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
              {/* Aspect Ratio Selector for text-to-image tool */}
              {type === 'genimage' && (
                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                  <label htmlFor="aspect-ratio-select-genimage" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                    Aspect Ratio:
                  </label>
                  <select
                    id="aspect-ratio-select-genimage"
                    value={aspectRatio}
                    onChange={e => setAspectRatio(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif' }}
                  >
                    <option value="1:1">1:1</option>
                    <option value="3:4">3:4</option>
                    <option value="4:3">4:3</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                  </select>
                </div>
              )}
              {/* Aspect Ratio Selector for text-to-video tool */}
              {type === 'text2video' && (
                (() => {
                  // Veo: fixed aspect
                  if (videoModel === 'veo') {
                    return (
                      <div style={{ marginBottom: '14px', textAlign: 'left', color: '#555', fontSize: '1rem', fontFamily: 'Inter, Arial, sans-serif' }}>
                        Aspect Ratio: <span style={{ fontWeight: 'bold' }}>16:9</span>
                      </div>
                    );
                  }
                  // Hailuo: auto aspect
                  if (videoModel === 'hailuo' || videoModel === 'hailuo-v2') {
                    return (
                      <div style={{ marginBottom: '14px', textAlign: 'left', color: '#555', fontSize: '1rem', fontFamily: 'Inter, Arial, sans-serif' }}>
                        Aspect Ratio: <span style={{ fontWeight: 'bold' }}>Auto (from input image)</span>
                      </div>
                    );
                  }
                  // Seedance/Luma/WAN: dropdown
                  const options = aspectOptions[videoModel] || aspectOptions['wan-2.1-i2v-720p'];
                  return (
                    <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                      <label htmlFor="aspect-ratio-select-txt" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                        Aspect Ratio:
                      </label>
                      <select
                        id="aspect-ratio-select-txt"
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif' }}
                      >
                        {options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()
              )}
              {type === 'text2video' && (
                <>
                  <select
                    value={videoModel}
                    onChange={e => setVideoModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontFamily: 'Inter, Arial, sans-serif'
                    }}
                  >
                    <option value="hailuo">Hailuo-02</option>
                    <option value="veo">Google Veo 3</option>
                  </select>
                  {/* Duration slider for text2video */}
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label htmlFor="duration-slider-t2v" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                      Video Length: <span style={{ color: '#c00' }}>{duration || 4} seconds</span>
                    </label>
                    <input
                      id="duration-slider-t2v"
                      type="range"
                      min={4}
                      max={10}
                      step={1}
                      value={duration || 4}
                      onChange={e => setDuration(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                      <span>5s</span>
                      <span>6s</span>
                      <span>7s</span>
                      <span>8s</span>
                      <span>9s</span>
                      <span>10s</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              loading={loading}
              variant="primary"
              className="w-full mt-2 creative-btn"
              style={{ fontWeight: 'bold', fontSize: '1.18rem', padding: '16px 28px', borderRadius: '18px', letterSpacing: '0.04em', boxShadow: '0 0 18px 2px #222, 0 0 8px 2px #444' }}
            >
              {loading
                ? (type === 'text2video' ? 'Creating Video...' : type === 'genvideo' ? 'Generating Video...' : type === 'image2video' ? 'Animating Image...' : 'Generating Image...')
                : type === 'text2video'
                ? '🎬 Create Video'
                : type === 'genvideo'
                ? '🎞️ Generate Video'
                : type === 'image2video'
                ? '🖼️ Animate Image'
                : '🖌️ Generate Image'}
            </Button>
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
            {loading && (
              <div style={{ marginTop: '18px', marginBottom: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: '#007bff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif' }}>
                  Processing... Please wait
                </span>
                <div style={{ margin: '10px auto', width: '40px', height: '40px', border: '4px solid #007bff', borderTop: '4px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
              </div>
            )}
            {error && <p style={{ color: 'red', marginTop: '10px', fontFamily: 'Inter, Arial, sans-serif' }}>{error}</p>}
            {previewUrl && (
              <div style={{ marginTop: '20px' }}>
                <img
                  src={previewUrl}
                  alt="Generated"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    marginBottom: '10px'
                  }}
                />
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="w-full mt-2"
                >
                  {previewUrl && (type === 'text2video' || type === 'genvideo' || type === 'image2video') ? '⬇️ Download Video' : '⬇️ Download Image'}
                </Button>
                {duration && (
                  <p style={{ marginTop: '10px', color: '#333', fontFamily: 'Inter, Arial, sans-serif' }}>
                    ⏱️ Generated in {duration} seconds
                  </p>
                )}
              </div>
            )}
          </>
        )}


        {tool.inputType === 'file' && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(12px)',
            border: '2px solid black',
            outline: '3px solid',
            outlineColor: 'transparent',
            borderImage: 'linear-gradient(90deg, #c00 0%, #007bff 100%) 1',
            padding: '32px 24px',
            marginBottom: '20px',
            transition: 'box-shadow 0.3s',
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
            <input
              type="file"
              accept="image/*"
              id="upload"
              className="upload-box model-box"
              onChange={e => setFile(e.target.files[0])}
            />
            {/* Aspect Ratio Selector for file tools */}
            {(type === 'image2video' || type === 'genvideo') && (
              (() => {
                // Hailuo models: auto aspect
                if (videoModel === 'hailuo' || videoModel === 'hailuo-v2') {
                  return (
                    <div style={{ marginBottom: '14px', textAlign: 'left', color: '#555', fontSize: '1rem', fontFamily: 'Inter, Arial, sans-serif' }}>
                      Aspect Ratio: <span style={{ fontWeight: 'bold' }}>Auto (from input image)</span>
                    </div>
                  );
                }
                // Other models: show dropdown
                const options = aspectOptions[videoModel] || aspectOptions['wan-2.1-i2v-720p'];
                return (
                  <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                    <label htmlFor="aspect-ratio-select-file" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                      Aspect Ratio:
                    </label>
                    <select
                      id="aspect-ratio-select-file"
                      value={aspectRatio}
                      onChange={e => setAspectRatio(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif' }}
                    >
                      {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              })()
            )}
            <style>{`
              .model-box {
                border: 1px solid #cccccc;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 16px;
                width: 100%;
                max-width: 400px;
                margin: 10px auto;
                display: block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                font-family: Inter, Arial, sans-serif;
                background: rgba(255,255,255,0.25);
                color: #222;
                font-weight: bold;
              }
            `}</style>
            <style>{`
              .upload-box {
                border: 1px solid #cccccc;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 16px;
                width: 100%;
                max-width: 400px;
                margin: 10px auto;
                display: block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                font-family: Inter, Arial, sans-serif;
                background: rgba(255,255,255,0.25);
                color: #222;
                font-weight: bold;
              }
            `}</style>
            {/* Model selection dropdown for video generation */}
            {(type === 'genvideo' || type === 'image2video') && (
              <>
                <select
                  value={videoModel}
                  onChange={e => setVideoModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '1rem',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    fontFamily: 'Inter, Arial, sans-serif'
                  }}
                >
                  {videoModels.map(model => (
                    <option key={model.value} value={model.value}>{model.name}</option>
                  ))}
                </select>
                {/* Show info for selected model */}
                <div style={{ marginBottom: '10px', color: '#555', fontSize: '0.98rem', fontFamily: 'Inter, Arial, sans-serif' }}>
                  {videoModels.find(m => m.value === videoModel)?.info}
                </div>
                {/* Duration slider by model */}
                {(() => {
                  // WAN 2.1: 5s or 10s
                  if (videoModel === 'wan-2.1-i2v-720p') {
                    return (
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label htmlFor="duration-slider-wan" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                          Video Length: <span style={{ color: '#c00' }}>{duration || 5} seconds</span>
                        </label>
                        <input
                          id="duration-slider-wan"
                          type="range"
                          min={5}
                          max={10}
                          step={5}
                          value={duration || 5}
                          onChange={e => setDuration(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                          <span>5s</span>
                          <span>10s</span>
                        </div>
                        <div style={{ color: '#c00', fontSize: '0.95rem', marginTop: '4px' }}>
                          10s may be less stable
                        </div>
                      </div>
                    );
                  }
                  // Seedance: 5s or 10s
                  if (videoModel === 'seedance-1-pro') {
                    return (
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label htmlFor="duration-slider-seedance" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                          Video Length: <span style={{ color: '#c00' }}>{duration || 5} seconds</span>
                        </label>
                        <input
                          id="duration-slider-seedance"
                          type="range"
                          min={5}
                          max={10}
                          step={5}
                          value={duration || 5}
                          onChange={e => setDuration(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                          <span>5s</span>
                          <span>10s</span>
                        </div>
                      </div>
                    );
                  }
                  // Luma Ray: 5s or 9s
                  if (videoModel === 'luma-ray-2-540p') {
                    return (
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label htmlFor="duration-slider-luma" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                          Video Length: <span style={{ color: '#c00' }}>{duration || 5} seconds</span>
                        </label>
                        <input
                          id="duration-slider-luma"
                          type="range"
                          min={5}
                          max={9}
                          step={4}
                          value={duration || 5}
                          onChange={e => setDuration(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                          <span>5s</span>
                          <span>9s</span>
                        </div>
                      </div>
                    );
                  }
                  // Hailuo: 6s or 10s
                  if (videoModel === 'hailuo' || videoModel === 'hailuo-v2') {
                    return (
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label htmlFor="duration-slider-hailuo" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                          Video Length: <span style={{ color: '#c00' }}>{duration || 6} seconds</span>
                        </label>
                        <input
                          id="duration-slider-hailuo"
                          type="range"
                          min={6}
                          max={10}
                          step={4}
                          value={duration || 6}
                          onChange={e => setDuration(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                          <span>6s</span>
                          <span>10s</span>
                        </div>
                        <div style={{ color: '#c00', fontSize: '0.95rem', marginTop: '4px' }}>
                          10s requires Pro
                        </div>
                      </div>
                    );
                  }
                  // Veo: up to 8s
                  if (videoModel === 'veo') {
                    return (
                      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label htmlFor="duration-slider-veo" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                          Video Length: <span style={{ color: '#c00' }}>{duration || 8} seconds</span>
                        </label>
                        <input
                          id="duration-slider-veo"
                          type="range"
                          min={4}
                          max={8}
                          step={1}
                          value={duration || 8}
                          onChange={e => setDuration(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                          <span>4s</span>
                          <span>5s</span>
                          <span>6s</span>
                          <span>7s</span>
                          <span>8s</span>
                        </div>
                        <div style={{ color: '#c00', fontSize: '0.95rem', marginTop: '4px' }}>
                          Max 8s supported
                        </div>
                      </div>
                    );
                  }
                  // Default: 5-10s
                  return (
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                      <label htmlFor="duration-slider-default" style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>
                        Video Length: <span style={{ color: '#c00' }}>{duration || 5} seconds</span>
                      </label>
                      <input
                        id="duration-slider-default"
                        type="range"
                        min={5}
                        max={10}
                        step={1}
                        value={duration || 5}
                        onChange={e => setDuration(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#888', marginTop: '2px' }}>
                        <span>5s</span>
                        <span>6s</span>
                        <span>7s</span>
                        <span>8s</span>
                        <span>9s</span>
                        <span>10s</span>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
            <Button
              onClick={handleGenerate}
              disabled={loading || !file}
              loading={loading}
              variant="primary"
              className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white border-none"
              style={{ fontWeight: 'bold', fontSize: '1.1rem', padding: '12px 20px', borderRadius: '8px' }}
            >
              {loading ? 'Generating...' : 'Generate Video'}
            </Button>
            {loading && (
              <div style={{ marginTop: '18px', marginBottom: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: '#007bff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif' }}>
                  Processing... Please wait
                </span>
                <div style={{ margin: '10px auto', width: '40px', height: '40px', border: '4px solid #007bff', borderTop: '4px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
              </div>
            )}
            {error && <p style={{ color: 'red', marginTop: '10px', fontFamily: 'Inter, Arial, sans-serif' }}>{error}</p>}
            {previewUrl && (
              <div style={{ marginTop: '20px' }}>
                <img
                  src={previewUrl}
                  alt="Generated"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '10px',
                    border: '1px solid #ccc',
                    marginBottom: '10px'
                  }}
                />
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="w-full mt-2"
                >
                  {previewUrl && (type === 'text2video' || type === 'genvideo' || type === 'image2video') ? '⬇️ Download Video' : '⬇️ Download Image'}
                </Button>
                {duration && (
                  <p style={{ marginTop: '10px', color: '#333', fontFamily: 'Inter, Arial, sans-serif' }}>
                    ⏱️ Generated in {duration} seconds
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {type === 'needhelp' && (
          <>
            <Button
              onClick={() => router.push('/contact')}
              variant="primary"
              className="w-full mt-2 creative-btn"
              style={{ fontWeight: 'bold', fontSize: '1.18rem', padding: '16px 28px', borderRadius: '18px', letterSpacing: '0.04em', boxShadow: '0 0 18px 2px #222, 0 0 8px 2px #444' }}
            >
              🛠️ Contact Support
            </Button>
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
          </>
        )}
      </div>
    </main>
  );
}