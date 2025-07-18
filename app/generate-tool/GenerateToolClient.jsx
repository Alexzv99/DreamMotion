'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function GenerateToolClient() {
  const router = useRouter();
  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setGenerationTime(Date.now());
    
    try {
      if (type === "image2video" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("https://your-remote-backend-url/animate", {
          method: "POST",
          body: formData
        });
        if (!response.ok) throw new Error("Failed to generate video");
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        setPreviewUrl(videoUrl);
      } else if (type === "genimage") {
        // Generate image using Flux API
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            type: 'genimage'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          throw new Error(`API request failed with status ${response.status}: ${errorData.error || errorData.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.output && data.output.length > 0) {
          // Replicate returns an array of URLs for images
          const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setPreviewUrl(imageUrl);
          
          // Calculate generation time
          const endTime = Date.now();
          const timeDiff = endTime - generationTime;
          const seconds = Math.round(timeDiff / 1000);
          setGenerationTimeString(`Generated in ${seconds}s`);
        } else {
          throw new Error(data.error || 'No image generated');
        }
      } else if (type === "genvideo" || type === "text2video") {
        // Generate video using existing API
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            type: type,
            video_model: videoModel,
            duration: duration
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.output) {
          const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setPreviewUrl(videoUrl);
          
          // Calculate generation time
          const endTime = Date.now();
          const timeDiff = endTime - generationTime;
          const seconds = Math.round(timeDiff / 1000);
          setGenerationTimeString(`Generated in ${seconds}s`);
        } else {
          throw new Error(data.error || 'No video generated');
        }
      } else {
        // Fallback for other types
        setTimeout(() => {
          setPreviewUrl('https://via.placeholder.com/512x512.png?text=Preview');
        }, 2000);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError("Error generating content: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  // Add missing state and placeholder functions to prevent runtime errors
  const [error, setError] = useState('');
  // Dynamic tool selection based on URL query param 'type'
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [type, setType] = useState(typeParam || 'genimage');
  useEffect(() => {
    if (typeParam && typeParam !== type) setType(typeParam);
  }, [typeParam]);

  // Tool definitions
  const toolMap = {
    genimage: {
      title: 'Generate Image',
      desc: 'Create stunning images from text prompts.',
      note: '',
      inputType: 'text'
    },
    genvideo: {
      title: 'Generate Video',
      desc: 'Animate your images into stunning videos.',
      note: '',
      inputType: 'text'
    },
    text2video: {
      title: 'Text to Video',
      desc: 'Generate videos from text input.',
      note: '',
      inputType: 'text'
    },
    // image2video tool removed
  };
  // Remove image2video from tool selection
  const filteredType = type === 'image2video' ? 'genimage' : type;
  const tool = toolMap[filteredType] || toolMap['genimage'];

  // ...existing state...
  const [videoModel, setVideoModel] = useState('veo-3-fast');
  const [duration, setDuration] = useState(6); // default 6s
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(0);
  const [generationTime, setGenerationTime] = useState(null);
  const [generationTimeString, setGenerationTimeString] = useState('');
  const [genvideoModels] = useState([
    { value: 'kling-v2.1', name: 'Kling v2.1' },
    { value: 'hailuo-02', name: 'Hailuo‑02' },
    { value: 'wan-2.1-i2v-720p', name: 'WAN‑2.1‑i2v‑720p' },
    { value: 'seedance-1-pro', name: 'Seedance‑1‑Pro' },
    { value: 'luma-ray', name: 'Luma / Ray' }
  ]);
  const [text2videoModels] = useState([
    { value: 'veo-3-fast', name: 'Veo 3 Fast' },
    { value: 'veo-3', name: 'Veo 3' },
    { value: 'hailuo-02', name: 'Hailuo 02' }
  ]);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Helper to get initial credits and cost for genvideo
  function getInitialGenVideoCredits(model) {
    switch (model) {
      case 'kling-v2.1': return '4 credits / second';
      case 'hailuo-02': return '5 credits / second';
      case 'wan-2.1-i2v-720p': return '9 credits / second';
      case 'seedance-1-pro': return '4 credits / second';
      case 'luma-ray': return '15 credits / second';
      default: return '2 credits / second';
    }
  }
  function getInitialGenVideoCost(model, durationVal) {
    const costMapping = {
      'kling-v2.1': { cost: 4, defaultDuration: 8 },
      'hailuo-02': { cost: 5, defaultDuration: 6 },
      'wan-2.1-i2v-720p': { cost: 9, defaultDuration: 10 },
      'seedance-1-pro': { cost: 4, defaultDuration: 8 },
      'luma-ray': { cost: 15, defaultDuration: 12 }
    };
    const modelData = costMapping[model] || { cost: 2, defaultDuration: durationVal };
    const costPerSecond = modelData.cost;
    const dur = durationVal || modelData.defaultDuration;
    return costPerSecond * dur;
  }

  const [toolCredits, setToolCredits] = useState(() => {
    if (typeParam === 'genvideo') {
      return getInitialGenVideoCredits(videoModel);
    } else if (typeParam === 'genimage') {
      return '2 credits / image';
    } else if (typeParam === 'text2video') {
      switch (videoModel) {
        case 'veo-3-fast': return '15 credits / second';
        case 'veo-3': return '25 credits / second';
        case 'hailuo-02': return '5 credits / second';
        default: return '2 credits / second';
      }
    }
    return '';
  });

  const [totalGenVideoCost, setTotalGenVideoCost] = useState(() => {
    if (typeParam === 'genvideo') {
      return getInitialGenVideoCost(videoModel, duration);
    }
    return null;
  });

  // Download function for generated content
  const handleDownload = async () => {
    if (!previewUrl) return;
    
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Determine file extension based on content type
      let fileExtension = 'file';
      if (type === 'genimage') {
        fileExtension = 'webp';
      } else if (type === 'genvideo' || type === 'text2video' || type === 'image2video') {
        fileExtension = 'mp4';
      }
      
      a.href = url;
      a.download = `dreammotion-${type}-${timestamp}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed. Please try again.');
    }
  };

  // Credits logic
  useEffect(() => {
    if (type === 'genimage') {
      setToolCredits('2 credits / image');
    } else if (type === 'genvideo') {
      if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else if (videoModel === 'kling-v2.1') setToolCredits('4 credits / second');
      else if (videoModel === 'wan-2.1-i2v-720p') setToolCredits('9 credits / second');
      else if (videoModel === 'seedance-1-pro') setToolCredits('4 credits / second');
      else if (videoModel === 'luma-ray') setToolCredits('15 credits / second');
      else setToolCredits('2 credits / second');
    } else if (type === 'text2video') {
      if (videoModel === 'veo-3-fast') setToolCredits('15 credits / second');
      else if (videoModel === 'veo-3') setToolCredits('25 credits / second');
      else if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else setToolCredits('2 credits / second');
    }
  }, [type, videoModel]);

  // Set initial toolCredits based on default videoModel and type
  // Remove incorrect initial credits effect for kling-v2.1
  // ...existing code...

  const aspectOptions = {
    'hailuo-02': [
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '4:3', label: '4:3' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' }
    ],
    'kling-v2.1': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '1:1', label: '1:1' }
    ],
    'wan-2.1-i2v-720p': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '1:1', label: '1:1' }
    ],
    'seedance-1-pro': [
      { value: '21:9', label: '21:9' },
      { value: '16:9', label: '16:9' },
      { value: '4:3', label: '4:3' },
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '9:16', label: '9:16' }
    ],
    'luma-ray': [
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '4:3', label: '4:3' },
      { value: '3:4', label: '3:4' },
      { value: '21:9', label: '21:9' },
      { value: '9:21', label: '9:21' }
    ],
    // text2video models
    'veo-3-fast': [
      { value: '16:9', label: '16:9' }
    ],
    'veo-3': [
      { value: '16:9', label: '16:9' }
    ]
  };

  // Calculate total cost for text2video
  let totalCost = null;
  if (type === 'text2video') {
    const costMapping = {
      'veo-3-fast': { cost: 15, defaultDuration: 8 },
      'veo-3': { cost: 25, defaultDuration: 8 },
      'hailuo-02': { cost: 5, defaultDuration: 6 }
    };

    const modelData = costMapping[videoModel] || { cost: 2, defaultDuration: duration };
    const costPerSecond = modelData.cost;
    let durationVal = duration || modelData.defaultDuration;

    // Ensure duration does not exceed 8 seconds for veo-3 and veo-3-fast
    if (['veo-3', 'veo-3-fast'].includes(videoModel)) {
      durationVal = Math.min(durationVal, 8);
    }

    if (durationVal) {
      totalCost = costPerSecond * durationVal;
    }
  }

  useEffect(() => {
    if (type === 'genvideo' && videoModel === 'hailuo-02') {
      setToolCredits('5 credits / second');
    }
  }, [type, videoModel]);

  useEffect(() => {
    if (type === 'text2video') {
      if (videoModel === 'hailuo-02') {
        setDuration(6); // Automatically set duration to 6 seconds
        setToolCredits('5 credits / second');
      } else if (videoModel === 'veo-3-fast') {
        setToolCredits('15 credits / second');
      } else if (videoModel === 'veo-3') {
        setToolCredits('25 credits / second');
      } else {
        setToolCredits('2 credits / second');
      }
    }
  }, [type, videoModel]);

  // Update useEffect to ensure kling-v2.1 shows the correct cost when entering genvideo tool
  useEffect(() => {
    if (type === 'genvideo') {
      setToolCredits(() => {
        switch (videoModel) {
          case 'kling-v2.1':
            return '4 credits / second';
          case 'hailuo-02':
            return '5 credits / second';
          case 'wan-2.1-i2v-720p':
            return '9 credits / second';
          case 'seedance-1-pro':
            return '4 credits / second';
          case 'luma-ray':
            return '15 credits / second';
          default:
            return '4 credits / second';
        }
      });
    }
  }, [type, videoModel]);

  useEffect(() => {
    if (type === 'genvideo') {
      if (videoModel === 'kling-v2.1') {
        setToolCredits('4 credits / second');
        setDuration(8); // Default duration for kling-v2.1
      }
      const costMapping = {
        'kling-v2.1': { cost: 4, defaultDuration: 8 },
        'hailuo-02': { cost: 5, defaultDuration: 6 },
        'wan-2.1-i2v-720p': { cost: 9, defaultDuration: 10 },
        'seedance-1-pro': { cost: 4, defaultDuration: 8 },
        'luma-ray': { cost: 15, defaultDuration: 12 }
      };
      const modelData = costMapping[videoModel] || { cost: 4, defaultDuration: duration };
      const costPerSecond = modelData.cost;
      const durationVal = duration || modelData.defaultDuration;
      setTotalGenVideoCost(costPerSecond * durationVal);
    }
  }, [type, videoModel]);

  // Dynamically calculate total cost for genvideo based on duration and model
  useEffect(() => {
    if (type === 'genvideo') {
      const costMapping = {
        'kling-v2.1': 4,
        'hailuo-02': 5,
        'wan-2.1-i2v-720p': 9,
        'seedance-1-pro': 4,
        'luma-ray': 15
      };
      const costPerSecond = costMapping[videoModel] || 2; // Default cost per second
      setTotalGenVideoCost(costPerSecond * duration);
    }
  }, [type, videoModel, duration]);

  // Set default duration based on video model for genvideo
  useEffect(() => {
    if (type === 'genvideo') {
      const defaultDurations = {
        'hailuo-02': 6,
        'kling-v2.1': 5,
        'wan-2.1-i2v-720p': 5,
        'seedance-1-pro': 5,
        'luma-ray': 5
      };
      const defaultDuration = defaultDurations[videoModel] || 5; // Default to 5 seconds if not specified
      setDuration(defaultDuration);
    }
  }, [type, videoModel]);

  useEffect(() => {
    if (type === 'genvideo') {
      const defaultModel = genvideoModels[0]?.value || 'kling-v2.1'; // Default to the first model or 'kling-v2.1'
      setVideoModel(defaultModel);
    }
  }, [type]);

  // Ensure 'type' state defaults to 'genimage' if not already set
  useEffect(() => {
    if (!type) {
      setType('genimage');
    }
  }, []);

  if (!tool) {
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
        <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#c00', background: '#fff' }}>
          Sorry, the selected tool is not available.<br />
          Please check your URL or select a valid tool.
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
      position: 'relative'
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        src="/background-video1.mp4"
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1
      }} />
      {/* All content below should have zIndex: 2 or higher if needed */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 2,
          background: '#fff',
          color: '#111',
          border: '2px solid #222',
          borderRadius: '10px',
          padding: '10px 18px',
          fontWeight: 'bold',
          fontSize: '1.08rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        ← Back
      </button>
      <div className="controls-card" style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 2px 18px rgba(30,30,40,0.10)',
        padding: '38px 38px 32px 38px',
        minWidth: 340,
        maxWidth: 480,
        margin: '32px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: 0,
        zIndex: 3,
        position: 'relative'
      }}>
        <span style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          letterSpacing: '1px',
          marginBottom: 8,
          color: '#111'
        }}>{tool.title}</span>
        <span style={{ fontSize: '1.18rem', fontWeight: 500, color: '#444', lineHeight: 1.5 }}>{tool.desc}</span>
        {tool.note && <div style={{ color: '#0070f3', fontWeight: 500, marginBottom: 8 }}>{tool.note}</div>}
        {type === 'text2video' && totalCost !== null && (
          <div style={{ fontSize: '1.05rem', color: '#0070f3', marginBottom: 8, fontWeight: 'bold' }}>
            Total Cost: <b>{totalCost} credits</b>
          </div>
        )}
        {type === 'genvideo' && (
          <div style={{ fontSize: '1.05rem', color: '#0070f3', marginBottom: 8, fontWeight: 'bold' }}>
            Total Cost: <b>{totalGenVideoCost} credits</b>
          </div>
        )}
        <div style={{ fontSize: '0.95rem', color: '#c00', marginBottom: 16, fontWeight: 'bold' }}>Credits: <b>{toolCredits}</b></div>
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
        {type === 'genimage' && (
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
              {['1:1', '3:4', '4:3', '16:9', '9:16'].map((ratio) => (
                <label key={ratio} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="aspectRatio"
                    value={ratio}
                    checked={aspectRatio === ratio}
                    onChange={() => setAspectRatio(ratio)}
                    style={{ accentColor: '#6366f1', marginRight: 4 }}
                  />
                  {ratio}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <label htmlFor="prompt" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Prompt</label>
              <textarea
                id="prompt"
                placeholder="Describe your scene or image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: '90%',
                  height: '120px',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1.5px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#222',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 6px rgba(60,60,60,0.08)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}
        {(type === 'text2video') && videoModel === 'hailuo-02' && (
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
        {(type === 'text2video') && videoModel === 'hailuo-02' && (
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
        {(type === 'genvideo') && (videoModel === 'hailuo-02' || videoModel === 'kling-v2.1' || videoModel === 'wan-2.1-i2v-720p' || videoModel === 'seedance-1-pro' || videoModel === 'luma-ray') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="duration" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Duration (seconds)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(videoModel === 'hailuo-02' ? [6, 10] :
                videoModel === 'kling-v2.1' ? [5, 10] :
                videoModel === 'wan-2.1-i2v-720p' ? [5, 10] :
                videoModel === 'seedance-1-pro' ? [5, 10] :
                videoModel === 'luma-ray' ? [5, 10] :
                []
              ).map(val => (
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
        {(type === 'text2video') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="prompt" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Prompt:</label>
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
        {type === 'genvideo' && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="prompt" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Prompt:</label>
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
        {type === 'genvideo' && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="file" style={{ fontWeight: 500 }}>Upload Image:</label>
            <input
              type="file"
              id="file"
              onChange={e => setFile(e.target.files[0])}
              style={{ marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', width: '100%' }}
            />
          </div>
        )}
        {error && <div style={{ color: '#c00', fontWeight: 500, marginBottom: 12 }}>{error}</div>}
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
                background: linear-gradient(90deg, #444 0%, #222 100%);
                box-shadow: 0 0 24px 3px #111, 0 0 12px 3px #333;
                transform: translateY(-2px);
              }
            `}</style>
          </Button>
        )}
        {type === 'needhelp' && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button onClick={() => router.push('/contact')} style={{ fontSize: '1.1rem', padding: '10px 32px', borderRadius: 12, background: '#0070f3', color: '#fff', fontWeight: 600 }}>
              Contact Support
            </Button>
          </div>
        )}
      </div>
      <div className="responsive-panel preview-panel" style={{
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
        boxShadow: '0 0 12px rgba(0,0,0,0.05)',
        zIndex: 3,
        position: 'relative'
      }}>
        {previewUrl ? (
          <div>
            {(type === 'text2video' || type === 'genvideo') ? (
              <video src={previewUrl} controls style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }} />
            ) : (
              <img src={previewUrl} alt="Generated Preview" style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }} />
            )}
            <button onClick={handleDownload} style={{ display: 'inline-block', fontSize: '1.08rem', padding: '12px 32px', borderRadius: '8px', backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 'bold', marginTop: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', letterSpacing: '1px', transition: 'background 0.2s' }}>Download</button>
          </div>
        ) : (
          <div style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {/* Loading Spinner */}
                <div style={{
                  width: 60,
                  height: 60,
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #ff3b3b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#444' }}>
                  {type === 'genimage' ? 'Generating your image...' : 'Generating your video...'}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#666' }}>
                  {type === 'genimage' ? 'This usually takes 10-15 seconds' : 'This may take several minutes'}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '1.1rem', color: '#888' }}>
                {type === 'genimage' ? 'Your image will appear here.' : 'Your video will appear here.'}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
// End of main return block
}