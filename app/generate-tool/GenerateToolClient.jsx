'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../supabaseClient';
import Script from 'next/script';

export default function GenerateToolClient() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Starting authentication check...');
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Auth error:', authError);
        }
        
        console.log('🔍 Authentication result:', { 
          user: user ? { id: user.id, email: user.email } : null,
          error: authError 
        });
        
        setUser(user);
        setAuthLoading(false);

        if (user) {
          console.log('✅ User authenticated:', { id: user.id, email: user.email });
          // Fetch user credits with retry logic
          let retryCount = 0;
          const maxRetries = 3;
        
        const fetchCredits = async () => {
          try {
            console.log('🔍 Attempting to fetch credits for user:', user.id);
            console.log('🔍 User object:', { id: user.id, email: user.email, aud: user.aud, role: user.role });
            
            // Check current session
            console.log('🔍 Checking current session...');
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
              console.error('❌ Session error:', sessionError);
            } else if (session) {
              console.log('✅ Valid session found:', { 
                user: session.user?.id, 
                expires: session.expires_at,
                token_type: session.token_type 
              });
            } else {
              console.log('⚠️ No active session found');
            }
            
            // First, let's test if we can connect to Supabase at all
            console.log('🔍 Testing basic Supabase connection...');
            const { data: testData, error: testError } = await supabase
              .from('users')
              .select('count')
              .limit(1);
            
            if (testError) {
              console.error('❌ Supabase connection test failed:', testError);
              console.log('Connection error details:', {
                code: testError.code,
                message: testError.message,
                details: testError.details,
                hint: testError.hint
              });
            } else {
              console.log('✅ Supabase connection test successful, count:', testData);
            }
            
            // Try to fetch all users first (to test table access)
            console.log('🔍 Testing users table access...');
            const { data: allUsers, error: allUsersError } = await supabase
              .from('users')
              .select('id, email, credits')
              .limit(5);
            
            if (allUsersError) {
              console.error('❌ Cannot access users table:', allUsersError);
            } else {
              console.log('✅ Users table accessible, sample data:', allUsers);
              const userExists = allUsers.find(u => u.id === user.id);
              console.log('🔍 Current user exists in table:', userExists ? 'YES' : 'NO', userExists);
            }
            
            // Now try to fetch the specific user
            console.log('🔍 Fetching specific user data...');
            
            // First, check if user exists and handle duplicates
            let { data: allUserData, error: queryError } = await supabase
              .from('users')
              .select('credits')
              .eq('id', user.id);

            if (queryError) {
              console.error('Supabase query error:', queryError.message);
              setCredits(0); // Fallback to 0 credits
              return;
            }

            if (!allUserData || allUserData.length === 0) {
              // No user found, create new user
              console.log('No user found, creating new user with 10 credits');
              const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: user.id, email: user.email, credits: 10 }]);

              if (!insertError) {
                console.log('New user inserted with 10 credits');
                setCredits(10);
              } else {
                console.error('Insert failed:', insertError.message);
                setCredits(0); // Fallback to 0 credits
              }
            } else if (allUserData.length > 1) {
              // Multiple users found - this shouldn't happen, but let's handle it
              console.warn(`Found ${allUserData.length} duplicate entries for user ${user.id}. Using the first one.`);
              setCredits(allUserData[0].credits);
              
              // Optionally, you could clean up duplicates here
              // Remove duplicate entries (keep the first one)
              for (let i = 1; i < allUserData.length; i++) {
                await supabase
                  .from('users')
                  .delete()
                  .eq('id', user.id)
                  .limit(1);
              }
              console.log('Cleaned up duplicate entries');
            } else {
              // Exactly one user found - normal case
              console.log('Credits fetched successfully:', allUserData[0].credits);
              setCredits(allUserData[0].credits);
            }
          } catch (err) {
            console.error('Unexpected error fetching credits:', err);
            setCredits(0);
          }
        };
        
        fetchCredits();
      } else {
        console.log('❌ No user authenticated');
      }
    } catch (err) {
      console.error('💥 Unexpected error in auth check:', err);
      setAuthLoading(false);
    }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add missing state and placeholder functions to prevent runtime errors
  const [error, setError] = useState('');
  // Dynamic tool selection based on URL query param 'type'
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [type, setType] = useState(typeParam || 'genimage');
  
  // State declarations - moved before useEffect that uses them
  const [videoModel, setVideoModel] = useState('veo-3-fast');
  const [duration, setDuration] = useState(6); // default 6s
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [generationTime, setGenerationTime] = useState(null);
  const [generationTimeString, setGenerationTimeString] = useState('');
  
  useEffect(() => {
    if (typeParam && typeParam !== type) setType(typeParam);
  }, [typeParam]);

  // Initialize duration when type changes to text2video
  useEffect(() => {
    if (type === 'text2video') {
      if (videoModel === 'veo-3-fast' || videoModel === 'veo-3') {
        setDuration(8); // Set to 8 seconds for Veo models
      } else if (videoModel === 'hailuo-02') {
        setDuration(5); // Set to 5 seconds for Hailuo-02
      }
    } else if (type === 'genvideo') {
      setDuration(5); // Default for genvideo, will be updated by model-specific useEffect
    } else if (type === 'image2video') {
      setDuration(5); // Default for image2video
    }
  }, [type, videoModel]);

  // Set appropriate models for image2video
  useEffect(() => {
    if (type === 'image2video') {
      // For image2video, use models that support image input
      // Default to kling-v2.1 as it has good image preservation
      if (!['kling-v2.1', 'luma-ray', 'wan-2.1-i2v-720p', 'seedance-1-pro', 'hailuo-02'].includes(videoModel)) {
        setVideoModel('kling-v2.1');
      }
    } else if (type === 'text2video') {
      // For text2video, use models that support text-only input
      if (!['veo-3-fast', 'veo-3', 'hailuo-02'].includes(videoModel)) {
        setVideoModel('veo-3-fast');
      }
    }
  }, [type]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Calculate credit cost for current generation
  const calculateCreditCost = () => {
    if (type === 'genimage') {
      return 2;
    } else if (type === 'genvideo' || type === 'text2video' || type === 'image2video') {
      const costMapping = {
        'kling-v2.1': 4,
        'hailuo-02': 5,
        'wan-2.1-i2v-720p': 13,
        'seedance-1-pro': 4,
        'luma-ray': 22,
        'veo-3-fast': 20,
        'veo-3': 35
      };
      const costPerSecond = costMapping[videoModel] || 2;
      return costPerSecond * (duration || 6);
    }
    return 2;
  };

  // Get model-specific time estimates (in minutes)
  const getTimeEstimate = () => {
    if (type === "text2video") {
      const timeMapping = {
        'wan-2.1': 3,      // Simple model - 3 minutes
        'luma-ray': 4,     // Medium model - 4 minutes
        'veo-3-fast': 6,   // Fast but complex - 6 minutes
        'veo-3': 10        // Most complex - 10 minutes
      };
      return timeMapping[videoModel] || 5;
    } else if (type === "image2video") {
      const timeMapping = {
        'kling-v2.1': 3,             // Fast model - 3 minutes
        'luma-ray': 4,               // Medium model - 4 minutes  
        'wan-2.1-i2v-720p': 5,       // Complex model - 5 minutes
        'seedance-1-pro': 4,         // Medium model - 4 minutes
        'hailuo-02': 4               // Medium complexity - 4 minutes
      };
      return timeMapping[videoModel] || 4;
    } else if (type === "genimage") {
      return 2; // Image generation is typically faster
    } else {
      return 4; // Other types
    }
  };

  const hasEnoughCredits = credits !== null && credits >= calculateCreditCost();

  // Timer management functions
  const startTimer = () => {
    setLoadingMinutes(0);
    const interval = setInterval(() => {
      setLoadingMinutes(prev => prev + 1);
    }, 60000); // Increment every minute
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setLoadingMinutes(0);
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setGenerationTime(Date.now());
    startTimer(); // Start the countdown timer
    
    try {
      if (type === "image2video" && file) {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Please log in to generate videos');
        }

        // Get session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication session expired. Please log in again.');
        }

        // Create FormData for image upload
        const formData = new FormData();
        formData.append("file", file);
        // For image2video, use minimal prompt to focus on the image
        formData.append("prompt", prompt || "animate this image smoothly, keeping the original content and style");
        formData.append("type", "genvideo"); // Use genvideo type for image-to-video
        formData.append("video_model", videoModel || "hailuo-02");
        formData.append("duration", duration || 5);
        formData.append("aspect_ratio", aspectRatio);
        // Add image_strength parameter to prioritize image over prompt
        formData.append("image_strength", "0.95"); // High image strength for image focus

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate video from image');
        }

        const data = await response.json();
        if (data.url) {
          setPreviewUrl(data.url);
        } else {
          throw new Error('No video URL received from server');
        }
      } else if (type === "genimage") {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Please log in to generate images');
        }

        // Get session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication session expired. Please log in again.');
        }

        // Generate image using Flux API
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            type: 'genimage'
          })
        });

        console.log('Sending API request with:', { prompt, aspect_ratio: aspectRatio, type: 'genimage' });

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
          
          // Update credits after successful generation (deduct the cost)
          const newCredits = credits - calculateCreditCost();
          console.log(`[IMAGE] Credit update: ${credits} -> ${newCredits} (deducted ${calculateCreditCost()})`);
          setCredits(newCredits);
          
          // Trigger storage event to notify other tabs/windows (like dashboard)
          localStorage.setItem('creditsUpdated', Date.now().toString());
          console.log('[IMAGE] Triggered creditsUpdated localStorage event');
          
          // Calculate generation time
          const endTime = Date.now();
          const timeDiff = endTime - generationTime;
          const seconds = Math.round(timeDiff / 1000);
          setGenerationTimeString(`Generated in ${seconds}s`);
        } else {
          throw new Error(data.error || 'No image generated');
        }
      } else if (type === "genvideo" || type === "text2video") {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Please log in to generate videos');
        }

        // Get session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication session expired. Please log in again.');
        }

        // For genvideo, check if image file is required
        if (type === "genvideo" && !file) {
          throw new Error('Please upload an image file for video generation');
        }

        let response;
        
        if (type === "text2video") {
          // Use JSON for text2video (no file upload needed)
          console.log(`🎬 Sending ${type} request with:`, { 
            prompt, 
            aspect_ratio: aspectRatio, 
            type, 
            video_model: videoModel, 
            duration
          });

          response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              prompt,
              aspect_ratio: aspectRatio,
              type,
              video_model: videoModel,
              duration
            })
          });
        } else {
          // Use FormData for genvideo (file upload needed)
          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("aspect_ratio", aspectRatio);
          formData.append("type", type);
          formData.append("video_model", videoModel);
          formData.append("duration", duration);
          
          // Add image file for genvideo
          if (file) {
            formData.append("file", file);
          }

          console.log(`🎬 Sending ${type} request with:`, { 
            prompt, 
            aspect_ratio: aspectRatio, 
            type, 
            video_model: videoModel, 
            duration,
            hasFile: !!file 
          });

          response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
              // Note: Don't set Content-Type for FormData, let browser set it
            },
            body: formData
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ API request failed:`, { 
            status: response.status, 
            statusText: response.statusText,
            error: errorData 
          });
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.output) {
          const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setPreviewUrl(videoUrl);
          
          // Update credits after successful generation (deduct the cost)
          const newCredits = credits - calculateCreditCost();
          console.log(`[VIDEO] Credit update: ${credits} -> ${newCredits} (deducted ${calculateCreditCost()})`);
          setCredits(newCredits);
          
          // Trigger storage event to notify other tabs/windows (like dashboard)
          localStorage.setItem('creditsUpdated', Date.now().toString());
          console.log('[VIDEO] Triggered creditsUpdated localStorage event');
          
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
      stopTimer(); // Stop the countdown timer
    }
  };

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
    image2video: {
      title: 'Image to Video',
      desc: 'Transform your images into dynamic videos.',
      note: '',
      inputType: 'file'
    }
  };
  
  const tool = toolMap[type] || toolMap['genimage'];

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
  const [image2videoModels] = useState([
    { value: 'kling-v2.1', name: 'Kling v2.1' },
    { value: 'luma-ray', name: 'Luma / Ray' },
    { value: 'wan-2.1-i2v-720p', name: 'WAN‑2.1‑i2v‑720p' },
    { value: 'seedance-1-pro', name: 'Seedance‑1‑Pro' },
    { value: 'hailuo-02', name: 'Hailuo‑02' }
  ]);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Helper to get initial credits and cost for genvideo
  function getInitialGenVideoCredits(model) {
    switch (model) {
      case 'kling-v2.1': return '4 credits / second';
      case 'hailuo-02': return '5 credits / second';
      case 'wan-2.1-i2v-720p': return '13 credits / second';
      case 'seedance-1-pro': return '4 credits / second';
      case 'luma-ray': return '22 credits / second';
      default: return '2 credits / second';
    }
  }
  function getInitialGenVideoCost(model, durationVal) {
    const costMapping = {
      'kling-v2.1': { cost: 4, defaultDuration: 8 },
      'hailuo-02': { cost: 5, defaultDuration: 6 },
      'wan-2.1-i2v-720p': { cost: 13, defaultDuration: 10 },
      'seedance-1-pro': { cost: 4, defaultDuration: 8 },
      'luma-ray': { cost: 22, defaultDuration: 12 }
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
        case 'veo-3-fast': return '20 credits / second';
        case 'veo-3': return '35 credits / second';
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
      else if (videoModel === 'wan-2.1-i2v-720p') setToolCredits('13 credits / second');
      else if (videoModel === 'seedance-1-pro') setToolCredits('4 credits / second');
      else if (videoModel === 'luma-ray') setToolCredits('22 credits / second');
      else setToolCredits('2 credits / second');
    } else if (type === 'image2video') {
      if (videoModel === 'kling-v2.1') setToolCredits('4 credits / second');
      else if (videoModel === 'luma-ray') setToolCredits('22 credits / second');
      else if (videoModel === 'wan-2.1-i2v-720p') setToolCredits('13 credits / second');
      else if (videoModel === 'seedance-1-pro') setToolCredits('4 credits / second');
      else if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else setToolCredits('4 credits / second');
    } else if (type === 'text2video') {
      if (videoModel === 'veo-3-fast') setToolCredits('20 credits / second');
      else if (videoModel === 'veo-3') setToolCredits('35 credits / second');
      else if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else setToolCredits('2 credits / second');
    }
  }, [type, videoModel]);

  // Reset aspect ratio when switching to text2video models (all only support 16:9)
  useEffect(() => {
    if (type === 'text2video') {
      // All text2video models only support 16:9
      setAspectRatio('16:9');
    }
  }, [type, videoModel]);

  // Set initial toolCredits based on default videoModel and type
  // Remove incorrect initial credits effect for kling-v2.1
  // ...existing code...

  // Function to get correct aspect options based on type and model
  const getAspectOptions = (currentType, currentVideoModel) => {
    if (currentType === 'text2video' && currentVideoModel === 'hailuo-02') {
      // For text2video with Hailuo-02, only 16:9 is supported
      return [{ value: '16:9', label: '16:9' }];
    }
    // For genvideo or other cases, use the regular options
    return aspectOptions[currentVideoModel] || [{ value: '16:9', label: '16:9' }];
  };

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
    ],
    'hailuo-02': [
      { value: '16:9', label: '16:9' }
    ]
  };

  // Calculate total cost for text2video
  let totalCost = null;
  if (type === 'text2video') {
    const costMapping = {
      'veo-3-fast': { cost: 20, defaultDuration: 8 },
      'veo-3': { cost: 35, defaultDuration: 8 },
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
        setDuration(5); // Automatically set duration to 5 seconds
        setToolCredits('5 credits / second');
      } else if (videoModel === 'veo-3-fast') {
        setDuration(8); // Automatically set duration to 8 seconds
        setToolCredits('20 credits / second');
      } else if (videoModel === 'veo-3') {
        setDuration(8); // Automatically set duration to 8 seconds
        setToolCredits('35 credits / second');
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
            return '13 credits / second';
          case 'seedance-1-pro':
            return '4 credits / second';
          case 'luma-ray':
            return '22 credits / second';
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
        'wan-2.1-i2v-720p': { cost: 13, defaultDuration: 10 },
        'seedance-1-pro': { cost: 4, defaultDuration: 8 },
        'luma-ray': { cost: 22, defaultDuration: 12 }
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
        'wan-2.1-i2v-720p': 13,
        'seedance-1-pro': 4,
        'luma-ray': 22
      };
      const costPerSecond = costMapping[videoModel] || 2; // Default cost per second
      setTotalGenVideoCost(costPerSecond * duration);
    }
  }, [type, videoModel, duration]);

  // Set default duration based on video model for genvideo
  useEffect(() => {
    if (type === 'genvideo') {
      const defaultDurations = {
        'hailuo-02': 5,
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

  if (authLoading) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="/background-video3.mp4" type="video/mp4" />
        </video>
        
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1
        }} />
        
        {/* Professional Login Required Banner - Centered Grey Design */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '24px 28px',
          zIndex: 10001,
          width: '520px',
          maxWidth: '90vw',
          fontSize: '0.95rem',
          fontWeight: '500',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ℹ
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '6px',
              fontSize: '1rem',
              color: '#000000'
            }}>
              Login Required
            </div>
            <div style={{ 
              opacity: 0.8,
              fontSize: '0.87rem',
              lineHeight: 1.4,
              marginBottom: '16px',
              color: '#333333'
            }}>
              Please log in to access the AI generation tools and start creating amazing content.
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#333333'}
                onMouseOut={(e) => e.target.style.background = '#000000'}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border: '2px solid #cccccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#999999';
                  e.target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#cccccc';
                  e.target.style.backgroundColor = '#ffffff';
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content area dimmed when not logged in */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          zIndex: 2,
          position: 'relative',
          opacity: 0.3,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '18px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '480px'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '16px' }}>
              AI Generation Tools
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              Create amazing images and videos with our AI tools
            </p>
          </div>
        </div>
      </main>
    );
  }

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
    <>
      <Script src="/test-supabase.js" />
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
        src="/background-video3.mp4"
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
        {credits !== null && (
          <div style={{ 
            fontSize: '1.1rem', 
            color: '#0070f3', 
            marginBottom: 8, 
            fontWeight: 'bold',
            background: '#f0f9ff',
            padding: '8px 16px',
            borderRadius: 8,
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>💰 Your Credits: <b>{credits}</b></span>
            <button
              onClick={async () => {
                if (user) {
                  console.log('Refreshing credits for user:', user.id);
                  const { data: userData, error } = await supabase
                    .from('users')
                    .select('credits')
                    .eq('id', user.id)
                    .single();
                  
                  if (error) {
                    console.error('Error refreshing credits:', error);
                  } else {
                    console.log('Refreshed credits:', userData?.credits);
                    setCredits(userData?.credits || 0);
                  }
                }
              }}
              style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🔄
            </button>
          </div>
        )}
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
        {(type === 'image2video') && (
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
              {image2videoModels.map(m => (
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
              {getAspectOptions(type, videoModel).map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} style={{ accentColor: '#6366f1', marginRight: 4 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {(type === 'text2video') && (videoModel === 'veo-3-fast' || videoModel === 'veo-3') && (
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
              {getAspectOptions(type, videoModel).map(opt => (
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
              {[5, 10].map(val => (
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
        {(type === 'text2video') && (videoModel === 'veo-3-fast' || videoModel === 'veo-3') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="duration" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Duration (seconds)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[8].map(val => (
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
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
              Veo models generate high-quality 8-second videos
            </p>
          </div>
        )}
        {(type === 'genvideo') && (videoModel === 'hailuo-02' || videoModel === 'kling-v2.1' || videoModel === 'wan-2.1-i2v-720p' || videoModel === 'seedance-1-pro' || videoModel === 'luma-ray') && (
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="duration" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'block' }}>Duration (seconds)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(videoModel === 'hailuo-02' ? [5, 10] :
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
        {credits !== null && !hasEnoughCredits && (
          <div style={{ 
            color: '#c00', 
            fontWeight: 500, 
            marginBottom: 12, 
            padding: '10px 14px',
            background: '#fef2f2',
            borderRadius: 8,
            border: '1px solid #fecaca'
          }}>
            ⚠️ Insufficient credits! You need {calculateCreditCost()} credits but only have {credits}.
            <br />
            <button 
              onClick={() => router.push('/subscribe')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Get More Credits
            </button>
          </div>
        )}
        {loading && (
          <div style={{ marginBottom: 12, color: '#444', fontWeight: 600, fontSize: '1.08rem' }}>
            {(type === 'text2video' || type === 'genvideo' || type === 'image2video') ? (() => {
              const totalEstimate = getTimeEstimate();
              const left = Math.max(totalEstimate - loadingMinutes, 0);
              return `Generating video... (~${left} minute${left !== 1 ? 's' : ''} left)`;
            })() : 'Generating image...'}
          </div>
        )}
        {(tool.inputType !== 'none') && (
          <Button
            onClick={hasEnoughCredits ? handleGenerate : undefined}
            className="creative-btn"
            disabled={!hasEnoughCredits || loading}
            style={{
              marginTop: 20,
              fontWeight: 'bold',
              fontSize: '1.18rem',
              padding: '16px 28px',
              borderRadius: '18px',
              letterSpacing: '0.04em',
              boxShadow: hasEnoughCredits && !loading ? '0 0 18px 2px #222, 0 0 8px 2px #444' : 'none',
              border: 'none',
              cursor: hasEnoughCredits && !loading ? 'pointer' : 'not-allowed',
              background: hasEnoughCredits && !loading ? 'linear-gradient(90deg, #222 0%, #444 100%)' : '#ccc',
              color: hasEnoughCredits && !loading ? '#fff' : '#666',
              position: 'relative',
              overflow: 'hidden',
              textTransform: 'uppercase',
              transition: 'box-shadow 0.3s, transform 0.2s, background 0.3s',
              opacity: hasEnoughCredits && !loading ? 1 : 0.6
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
        {loading ? (
          // Always show loading state when generating, regardless of previous results
          <div style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
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
              {type !== 'genimage' && (
                <div style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', maxWidth: '300px' }}>
                  {(() => {
                    const totalEstimate = getTimeEstimate();
                    const left = Math.max(totalEstimate - loadingMinutes, 0);
                    return `Estimated time: ~${left} minute${left !== 1 ? 's' : ''} remaining`;
                  })()}
                </div>
              )}
            </div>
          </div>
        ) : previewUrl ? (
          // Show result only when not loading and result exists
          <div>
            {(type === 'text2video' || type === 'genvideo') ? (
              <video src={previewUrl} controls style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }} />
            ) : (
              <img src={previewUrl} alt="Generated Preview" style={{ maxWidth: '90%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 18 }} />
            )}
            <button onClick={handleDownload} style={{ display: 'inline-block', fontSize: '1.08rem', padding: '12px 32px', borderRadius: '8px', backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 'bold', marginTop: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', letterSpacing: '1px', transition: 'background 0.2s' }}>Download</button>
          </div>
        ) : (
          // Show placeholder when no result and not loading
          <div style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
            Your generated content will appear here
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
    </>
  );
// End of main return block
}