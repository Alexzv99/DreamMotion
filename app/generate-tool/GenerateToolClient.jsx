'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../supabaseClient';
import { useAsyncGeneration } from '../../hooks/useAsyncGeneration';
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // For input image preview
  const [loading, setLoading] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [generationTime, setGenerationTime] = useState(null);
  const [generationTimeString, setGenerationTimeString] = useState('');
  const [contentWarning, setContentWarning] = useState('');
  const [blockedWords, setBlockedWords] = useState([]);
  const [isContentBlocked, setIsContentBlocked] = useState(false);
  
  // Async generation state
  const [asyncPredictionId, setAsyncPredictionId] = useState(null);
  const [isAsyncGeneration, setIsAsyncGeneration] = useState(false);
  
  // Universal progress tracking for all models
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncProgressInterval, setSyncProgressInterval] = useState(null);
  
  // Generation lock to prevent multiple simultaneous generations
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Error banner state
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorBannerMessage, setErrorBannerMessage] = useState('');
  const [errorBannerType, setErrorBannerType] = useState(''); // 'image' or 'video'
  
  // Function to show error banner with credit refund message
  const showErrorWithRefund = (isImageGeneration, customMessage = null) => {
    const baseMessage = isImageGeneration 
      ? 'Error generating image. Your credits will be refunded.' 
      : 'Error generating video. Your credits will be refunded.';
    
    setErrorBannerMessage(customMessage || baseMessage);
    setErrorBannerType(isImageGeneration ? 'image' : 'video');
    setShowErrorBanner(true);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setShowErrorBanner(false);
    }, 8000);
  };
  
  // Function to hide error banner
  const hideErrorBanner = () => {
    setShowErrorBanner(false);
  };
  
  // Setup async generation monitoring
  const asyncGeneration = useAsyncGeneration(
    asyncPredictionId,
    (data) => {
      // On completion
      console.log('🎉 ===== ASYNC COMPLETION CALLBACK TRIGGERED ===== 🎉');
      console.log('✅ Async generation completed:', data);
      console.log('📹 Video output URL:', data.output);
      console.log('🔧 About to call setPreviewUrl with:', data.output);
      
      setPreviewUrl(data.output);
      setLoading(false);
      setIsAsyncGeneration(false);
      setAsyncPredictionId(null);
      setIsGenerating(false); // Unlock generation
      
      console.log('🔧 State updates completed - loading should be false now');
      
      // Don't update credits here - they were already deducted when starting
      // Just trigger a credit refresh for the UI
      localStorage.setItem('creditsUpdated', Date.now().toString());
      
      // Calculate final time
      setGenerationTimeString(`Generated in ${data.completed_at ? 
        Math.round((new Date(data.completed_at) - generationTime) / 1000) : 
        asyncGeneration.timeElapsedSeconds}s`);
      
      stopTimer();
      
      console.log('🎉 ===== ASYNC COMPLETION CALLBACK FINISHED ===== 🎉');
    },
    (error) => {
      // On error - show refund message
      console.error('❌ Async generation failed:', error);
      
      // Show error banner with refund message
      const isImageGeneration = type === 'genimage';
      showErrorWithRefund(isImageGeneration, error);
      
      setError(''); // Clear regular error since we're showing banner
      setLoading(false);
      setIsAsyncGeneration(false);
      setAsyncPredictionId(null);
      setIsGenerating(false); // Unlock generation
      stopTimer();
      
      // Refresh credits to show refund
      setTimeout(() => {
        localStorage.setItem('creditsUpdated', Date.now().toString());
      }, 2000);
    }
  );
  useEffect(() => {
    if (typeParam && typeParam !== type) setType(typeParam);
  }, [typeParam]);

  // Listen for credit updates from localStorage (for async generations and refunds)
  useEffect(() => {
    const handleCreditsUpdate = () => {
      // Re-fetch credits when updated
      if (user) {
        const refetchCredits = async () => {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('credits')
              .eq('id', user.id)
              .single();

            if (!error && userData) {
              console.log('🔄 Credits refreshed:', userData.credits);
              setCredits(userData.credits);
            }
          } catch (err) {
            console.error('Error refreshing credits:', err);
          }
        };
        refetchCredits();
      }
    };

    // Listen for storage events (from other tabs or async operations)
    window.addEventListener('storage', handleCreditsUpdate);
    
    // Also listen for custom creditsUpdated events
    const handleCustomUpdate = () => {
      handleCreditsUpdate();
    };
    
    // Check for updates every few seconds during async operations
    let creditCheckInterval;
    if (isAsyncGeneration) {
      creditCheckInterval = setInterval(handleCreditsUpdate, 3000);
    }

    return () => {
      window.removeEventListener('storage', handleCreditsUpdate);
      if (creditCheckInterval) {
        clearInterval(creditCheckInterval);
      }
    };
  }, [user, isAsyncGeneration]);

  // Clear preview when type changes
  useEffect(() => {
    setPreviewUrl('');
  }, [type]);

  // Initialize duration when type changes to text2video
  useEffect(() => {
    if (type === 'text2video') {
      if (videoModel === 'veo-3-fast' || videoModel === 'veo-3') {
        setDuration(8); // Set to 8 seconds for Veo models
      } else if (videoModel === 'hailuo-02') {
        setDuration(6); // Set to 6 seconds for Hailuo-02 (API only accepts 6,10)
      } else if (videoModel === 'luma-ray') {
        setDuration(6); // Set to 6 seconds for Luma Ray (API accepts 6,10)
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
      if (!['kling-v2.1', 'wan-2.1-i2v-720p', 'seedance-1-pro', 'hailuo-02'].includes(videoModel)) {
        setVideoModel('kling-v2.1');
      }
    } else if (type === 'text2video') {
      // For text2video, use models that support text-only input
      if (!['veo-3-fast', 'veo-3', 'hailuo-02', 'luma-ray'].includes(videoModel)) {
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
      if (syncProgressInterval) {
        clearInterval(syncProgressInterval);
      }
    };
  }, [timerInterval, syncProgressInterval]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [previewUrl, imagePreviewUrl]);

  // Content filtering system - automatic word replacement
  const wordReplacements = {
    // Explicit content replacements
    'nude': 'artistic figure',
    'naked': 'unclothed artistic form',
    'bikini': 'swimwear',
    'lingerie': 'undergarments',
    'underwear': 'undergarments',
    'topless': 'bare-chested',
    'explicit': 'mature',
    'sexual': 'romantic',
    'erotic': 'sensual',
    'porn': 'adult content',
    'adult': 'mature',
    
    // Violence replacements
    'violence': 'conflict',
    'blood': 'red liquid',
    'gore': 'graphic content',
    'kill': 'defeat',
    'murder': 'eliminate',
    'death': 'ending',
    'weapon': 'tool',
    'gun': 'device',
    'knife': 'blade',
    'bomb': 'explosive device',
    'terrorist': 'antagonist',
    
    // Gambling replacements
    'casino': 'gaming establishment',
    'gambling': 'gaming',
    'poker': 'card game',
    'blackjack': 'card game',
    'slot machine': 'gaming machine',
    'betting': 'wagering',
    'lottery': 'draw game',
    
    // Drugs replacements
    'drugs': 'substances',
    'cocaine': 'powder',
    'heroin': 'substance',
    'marijuana': 'plant',
    'weed': 'plant',
    'cannabis': 'herb',
    'smoking': 'using',
    'cigarette': 'stick',
    
    // Hate speech replacements
    'hate': 'dislike',
    'racist': 'prejudiced',
    'nazi': 'extremist',
    'discrimination': 'bias',
    
    // Other inappropriate replacements
    'prostitute': 'worker',
    'escort': 'companion',
    'brothel': 'establishment'
  };

  const replaceBlockedWords = (text) => {
    if (!text) return text;
    
    let replacedText = text;
    let replacedWords = [];
    
    // Case-insensitive replacement
    Object.entries(wordReplacements).forEach(([blocked, replacement]) => {
      const regex = new RegExp(`\\b${blocked}\\b`, 'gi');
      if (regex.test(replacedText)) {
        replacedWords.push(blocked);
        replacedText = replacedText.replace(regex, replacement);
      }
    });
    
    return { text: replacedText, replacedWords };
  };

  const checkAndReplaceContent = (text) => {
    if (!text) {
      setContentWarning('');
      setBlockedWords([]);
      setIsContentBlocked(false);
      return;
    }

    const result = replaceBlockedWords(text);
    
    if (result.replacedWords.length > 0) {
      setBlockedWords(result.replacedWords);
      setIsContentBlocked(false); // Don't block, just inform
      setContentWarning(`Auto-replaced words: ${result.replacedWords.join(', ')} → will be sent as safer alternatives`);
    } else {
      setBlockedWords([]);
      setIsContentBlocked(false);
      setContentWarning('');
    }
  };

  // Check content when prompt changes
  useEffect(() => {
    checkAndReplaceContent(prompt);
  }, [prompt]);

  // Calculate credit cost for current generation
  const calculateCreditCost = () => {
    if (type === 'genimage') {
      return 3;
    } else if (type === 'genvideo' || type === 'text2video' || type === 'image2video') {
      const costMapping = {
        'kling-v2.1': 4,
        'hailuo-02': 5,
        'wan-2.1-i2v-720p': 13,
        'seedance-1-pro': 4,
        'runway-gen4': 25,
        'luma-ray': 22,
        'veo-3-fast': 20,
        'veo-3': 35
      };
      const costPerSecond = costMapping[videoModel] || 2;
      return costPerSecond * (duration || 6);
    }
    return 3;
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

  // Function to detect image aspect ratio and find the closest supported ratio
  const detectImageAspectRatio = (file, supportedRatios) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const detectedRatio = width / height;
        
        console.log(`🔍 Image dimensions: ${width}x${height}, ratio: ${detectedRatio.toFixed(3)}`);
        
        // Common aspect ratios and their decimal values
        const aspectRatioMap = {
          '1:1': 1.0,
          '4:3': 1.333,
          '3:4': 0.75,
          '16:9': 1.778,
          '9:16': 0.563,
          '21:9': 2.333,
          '9:21': 0.429,
          '4:5': 0.8,
          '5:4': 1.25,
          '2:3': 0.667,
          '3:2': 1.5,
          '2:5': 0.4,
          '5:2': 2.5,
          '9:2': 4.5
        };
        
        // Find the closest supported aspect ratio
        let closestRatio = supportedRatios[0]; // Default to first supported
        let smallestDifference = Infinity;
        
        supportedRatios.forEach(ratio => {
          const targetValue = aspectRatioMap[ratio];
          if (targetValue) {
            const difference = Math.abs(detectedRatio - targetValue);
            if (difference < smallestDifference) {
              smallestDifference = difference;
              closestRatio = ratio;
            }
          }
        });
        
        console.log(`✅ Auto-detected aspect ratio: ${closestRatio} (closest to ${detectedRatio.toFixed(3)})`);
        URL.revokeObjectURL(url);
        resolve(closestRatio);
      };
      
      img.onerror = () => {
        console.error('❌ Failed to load image for aspect ratio detection');
        URL.revokeObjectURL(url);
        resolve(supportedRatios[0]); // Fallback to first supported ratio
      };
      
      img.src = url;
    });
  };

  // Get supported aspect ratios for current model
  const getSupportedAspectRatios = (modelName) => {
    const modelAspectRatios = {
      'luma-ray': ['1:1', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9'], // Based on exact API schema
      'kling-v2.1': ['16:9', '9:16', '1:1'], // Exactly as you specified
      'wan-2.1-i2v-720p': ['16:9', '9:16', '1:1'], // Exactly as you specified
      'seedance-1-pro': ['16:9'], // Seedance Pro ignores aspect_ratio for images (uses image natural ratio)
      'hailuo-02': ['16:9'], // Hailuo-02 uses image natural ratio for image2video
      // Text2video models (for completeness)
      'veo-3-fast': ['16:9'],
      'veo-3': ['16:9'],
    };
    
    return modelAspectRatios[modelName] || ['16:9', '1:1']; // Default fallback
  };

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

  // Sync progress management functions
  const startSyncProgress = () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        // Much slower, more realistic progress simulation for sync generations
        if (prev < 10) return prev + 1; // Slow start
        if (prev < 30) return prev + 0.8; // Steady but slower progress
        if (prev < 60) return prev + 0.5; // Slower middle
        if (prev < 85) return prev + 0.3; // Very slow near end
        return Math.min(prev + 0.1, 93); // Crawl to 93% max
      });
    }, 2000); // Update every 2 seconds for slower, smoother animation
    setSyncProgressInterval(interval);
  };

  const stopSyncProgress = () => {
    if (syncProgressInterval) {
      clearInterval(syncProgressInterval);
      setSyncProgressInterval(null);
    }
    setSyncProgress(0);
  };

  const completeSyncProgress = () => {
    setSyncProgress(100);
    setTimeout(() => {
      stopSyncProgress();
    }, 500); // Show 100% briefly before clearing
  };

  const handleGenerate = async () => {
    // Prevent multiple simultaneous generations
    if (isGenerating) {
      console.log('🚫 Generation already in progress, ignoring duplicate request');
      return;
    }
    
    setError("");
    setIsGenerating(true); // Lock generation
    setLoading(true);
    setGenerationTime(Date.now());
    startTimer(); // Start the countdown timer
    
    // All models now use sync processing - no async responses
    
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
        
        // For image2video, use minimal prompt to focus on the image with word replacement
        let basePrompt = prompt || "animate this image smoothly, keeping the original content and style";
        
        // Model-specific prompt optimization for better image preservation
        if (videoModel === 'seedance-1-pro') {
          // Seedance Pro needs very minimal prompts to preserve image content
          // Also ensure duration is 5 or 10 (schema constraint)
          basePrompt = prompt || "animate smoothly";
          console.log('🔧 Using ultra-minimal prompt for Seedance Pro image preservation');
        } else if (videoModel === 'wan-2.1-i2v-720p' || videoModel === 'hailuo-02') {
          // WAN-2.1 and Hailuo-02 work well with standard prompt and focus on image preservation
          basePrompt = prompt || "animate this image smoothly, keeping the original content and style";
          console.log(`🔧 Using standard image-focused prompt for ${videoModel} (proven to work well)`);
        }
        
        const safePrompt = replaceBlockedWords(basePrompt).text;
        formData.append("prompt", safePrompt);
        formData.append("type", "genvideo"); // Use genvideo type for image-to-video processing
        formData.append("video_model", videoModel || "kling-v2.1");
        formData.append("duration", duration || 5);
        
        // Use the auto-detected aspect ratio
        formData.append("aspect_ratio", aspectRatio);
        console.log(`🔧 Image2Video: Using auto-detected aspect ratio ${aspectRatio} for ${videoModel}`);
        
        // Add image_strength parameter to prioritize image over prompt (will be handled per-model in backend)
        formData.append("image_strength", "0.95"); // High image strength for image focus

        // Start sync progress tracking for image2video
        startSyncProgress();

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
          completeSyncProgress(); // Complete progress to 100%
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

        // Start sync progress tracking for image generation
        startSyncProgress();

        // Generate image using Flux API
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            prompt: replaceBlockedWords(prompt).text,
            aspect_ratio: aspectRatio,
            type: 'genimage'
          })
        });

        console.log('Sending API request with:', { prompt, aspect_ratio: aspectRatio, type: 'genimage' });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          
          // Check if error includes refund information
          if (errorData.refunded && errorData.refundMessage) {
            const isImageGeneration = errorData.isImageGeneration || type === 'genimage';
            showErrorWithRefund(isImageGeneration, `${errorData.error}. ${errorData.refundMessage}`);
            
            // Refresh credits after a delay to show refund
            setTimeout(() => {
              localStorage.setItem('creditsUpdated', Date.now().toString());
            }, 2000);
            
            return; // Don't throw error, banner will handle it
          }
          
          throw new Error(`API request failed with status ${response.status}: ${errorData.error || errorData.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.output && data.output.length > 0) {
          // Replicate returns an array of URLs for images
          const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          completeSyncProgress(); // Complete progress to 100%
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

          // Start sync progress tracking for text2video
          startSyncProgress();

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
          formData.append("prompt", replaceBlockedWords(prompt).text);
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

          // Start sync progress tracking for genvideo
          startSyncProgress();

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
          
          // Check if error includes refund information
          if (errorData.refunded && errorData.refundMessage) {
            const isImageGeneration = errorData.isImageGeneration || false;
            showErrorWithRefund(isImageGeneration, `${errorData.error}. ${errorData.refundMessage}`);
            
            // Refresh credits after a delay to show refund
            setTimeout(() => {
              localStorage.setItem('creditsUpdated', Date.now().toString());
            }, 2000);
            
            return; // Don't throw error, banner will handle it
          }
          
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // ASYNC PROCESSING DISABLED - All models now use sync processing
        // Backend no longer returns 202 status, all models return 200 with immediate results
        console.log(`🔧 All models use sync processing - expecting immediate output`);

        // Handle all responses as synchronous (all models are now sync)
        if (data.output) {
          const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          completeSyncProgress(); // Complete progress to 100%
          setPreviewUrl(videoUrl);
          
          // Update credits after successful generation (deduct the cost)
          const newCredits = credits - calculateCreditCost();
          console.log(`[SYNC VIDEO] Credit update: ${credits} -> ${newCredits} (deducted ${calculateCreditCost()})`);
          setCredits(newCredits);
          
          // Trigger storage event to notify other tabs/windows (like dashboard)
          localStorage.setItem('creditsUpdated', Date.now().toString());
          console.log('[SYNC VIDEO] Triggered creditsUpdated localStorage event');
          
          // Calculate generation time
          const endTime = Date.now();
          const timeDiff = endTime - generationTime;
          const seconds = Math.round(timeDiff / 1000);
          setGenerationTimeString(`Generated in ${seconds}s`);
        } else {
          // No output received - this is an error for sync models
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
      
      // Stop sync progress on error
      stopSyncProgress();
      
      // Show error banner instead of regular error message
      const isImageGeneration = type === 'genimage';
      showErrorWithRefund(isImageGeneration, `Error generating ${isImageGeneration ? 'image' : 'video'}. Your credits will be refunded.`);
      
      setError(''); // Clear regular error since we're showing banner
      setLoading(false);
      setIsAsyncGeneration(false);
      setAsyncPredictionId(null);
      setIsGenerating(false); // Unlock generation
      stopTimer();
      
      // Refresh credits after a delay to show potential refund
      setTimeout(() => {
        localStorage.setItem('creditsUpdated', Date.now().toString());
      }, 2000);
    } finally {
      // All models are now sync - always stop loading and cleanup
      setLoading(false);
      setIsGenerating(false); // Unlock generation
      stopTimer();
      stopSyncProgress(); // Stop sync progress
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
    { value: 'seedance-1-pro', name: 'Seedance‑1‑Pro' },
    { value: 'hailuo-02', name: 'Hailuo‑02' },
    { value: 'wan-2.1-i2v-720p', name: 'WAN‑2.1‑i2v‑720p' },
    { value: 'runway-gen4', name: 'Runway Gen4' }
  ]);
  const [text2videoModels] = useState([
    { value: 'hailuo-02', name: 'Hailuo 02' },
    { value: 'luma-ray', name: 'Luma / Ray' },
    { value: 'veo-3-fast', name: 'Veo 3 Fast' },
    { value: 'veo-3', name: 'Veo 3' }
  ]);
  const [image2videoModels] = useState([
    { value: 'kling-v2.1', name: 'Kling v2.1' },
    { value: 'wan-2.1-i2v-720p', name: 'WAN‑2.1‑i2v‑720p' },
    { value: 'seedance-1-pro', name: 'Seedance‑1‑Pro' },
    { value: 'hailuo-02', name: 'Hailuo‑02' },
    { value: 'runway-gen4', name: 'Runway Gen4' }
  ]);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Helper to get initial credits and cost for genvideo
  function getInitialGenVideoCredits(model) {
    switch (model) {
      case 'kling-v2.1': return '4 credits / second';
      case 'hailuo-02': return '5 credits / second';
      case 'wan-2.1-i2v-720p': return '13 credits / second';
      case 'seedance-1-pro': return '4 credits / second';
      case 'runway-gen4': return '25 credits / second';
      default: return '2 credits / second';
    }
  }
  function getInitialGenVideoCost(model, durationVal) {
    const costMapping = {
      'kling-v2.1': { cost: 4, defaultDuration: 8 },
      'hailuo-02': { cost: 5, defaultDuration: 6 },
      'wan-2.1-i2v-720p': { cost: 13, defaultDuration: 10 },
      'seedance-1-pro': { cost: 4, defaultDuration: 8 },
      'runway-gen4': { cost: 25, defaultDuration: 5 }
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
      return '3 credits / image';
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
      setToolCredits('3 credits / image');
    } else if (type === 'genvideo') {
      if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else if (videoModel === 'kling-v2.1') setToolCredits('4 credits / second');
      else if (videoModel === 'wan-2.1-i2v-720p') setToolCredits('13 credits / second');
      else if (videoModel === 'seedance-1-pro') setToolCredits('4 credits / second');
      else if (videoModel === 'runway-gen4') setToolCredits('25 credits / second');
      else if (videoModel === 'luma-ray') setToolCredits('22 credits / second');
      else setToolCredits('2 credits / second');
    } else if (type === 'image2video') {
      if (videoModel === 'kling-v2.1') setToolCredits('4 credits / second');
      else if (videoModel === 'wan-2.1-i2v-720p') setToolCredits('13 credits / second');
      else if (videoModel === 'seedance-1-pro') setToolCredits('4 credits / second');
      else if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else if (videoModel === 'runway-gen4') setToolCredits('25 credits / second');
      else setToolCredits('4 credits / second');
    } else if (type === 'text2video') {
      if (videoModel === 'veo-3-fast') setToolCredits('20 credits / second');
      else if (videoModel === 'veo-3') setToolCredits('35 credits / second');
      else if (videoModel === 'hailuo-02') setToolCredits('5 credits / second');
      else if (videoModel === 'luma-ray') setToolCredits('22 credits / second');
      else setToolCredits('2 credits / second');
    }
  }, [type, videoModel]);

  // Reset aspect ratio when switching to text2video models (most only support 16:9)
  useEffect(() => {
    if (type === 'text2video') {
      // Most text2video models only support 16:9, except Luma Ray which uses 1:1
      if (videoModel === 'luma-ray') {
        setAspectRatio('1:1');
      } else {
        // All other text2video models (veo-3, veo-3-fast, hailuo-02) use 16:9
        setAspectRatio('16:9');
      }
    }
  }, [type, videoModel]);

  // Initialize aspect ratio based on type after component is ready
  useEffect(() => {
    // Only run this initialization if we haven't already set a specific aspect ratio
    const timer = setTimeout(() => {
      if (type === 'image2video' && videoModel === 'kling-v2.1' && aspectRatio === '1:1') {
        setAspectRatio('16:9');
      }
    }, 100); // Small delay to ensure state is initialized
    
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  // Auto-detect aspect ratio when image is uploaded for image2video
  useEffect(() => {
    if ((type === 'image2video' || type === 'genvideo') && file && file instanceof File) {
      const supportedRatios = getSupportedAspectRatios(videoModel);
      
      detectImageAspectRatio(file, supportedRatios).then((detectedRatio) => {
        console.log(`🎯 Auto-setting aspect ratio to ${detectedRatio} for ${videoModel}`);
        setAspectRatio(detectedRatio);
      });
    }
  }, [file, videoModel, type]); // Re-run when file, model, or type changes

  // Set initial toolCredits based on default videoModel and type
  // Remove incorrect initial credits effect for kling-v2.1
  // ...existing code...

  // Function to get correct aspect options based on type and model
  const getAspectOptions = (currentType, currentVideoModel) => {
    if (currentType === 'text2video') {
      if (currentVideoModel === 'luma-ray') {
        // Luma Ray shows only 1:1 option (fixed aspect ratio)
        return [{ value: '1:1', label: '1:1' }];
      } else {
        // All other text2video models (veo-3, veo-3-fast, hailuo-02) show only 16:9
        return [{ value: '16:9', label: '16:9' }];
      }
    }
    // For genvideo or other cases, use the regular options
    return aspectOptions[currentVideoModel] || [{ value: '16:9', label: '16:9' }];
  };

  const aspectOptions = {
    'hailuo-02': [
      { value: '16:9', label: '16:9 (auto from image)' }
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
      { value: '16:9', label: '16:9 (auto from image)' }
    ],
    'luma-ray': [
      { value: '1:1', label: '1:1' },
      { value: '3:4', label: '3:4' },
      { value: '4:3', label: '4:3' },
      { value: '9:16', label: '9:16' },
      { value: '16:9', label: '16:9' },
      { value: '9:21', label: '9:21' },
      { value: '21:9', label: '21:9' }
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
      'veo-3-fast': { cost: 20, defaultDuration: 8 },
      'veo-3': { cost: 35, defaultDuration: 8 },
      'hailuo-02': { cost: 5, defaultDuration: 6 },
      'luma-ray': { cost: 22, defaultDuration: 6 }
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
        setToolCredits('5 credits / second');
      } else if (videoModel === 'veo-3-fast') {
        setDuration(8); // Automatically set duration to 8 seconds
        setToolCredits('20 credits / second');
      } else if (videoModel === 'veo-3') {
        setDuration(8); // Automatically set duration to 8 seconds
        setToolCredits('35 credits / second');
      } else if (videoModel === 'luma-ray') {
        setToolCredits('22 credits / second');
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
          case 'runway-gen4':
            return '25 credits / second';
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
        'runway-gen4': { cost: 25, defaultDuration: 5 },
        'luma-ray': { cost: 22, defaultDuration: 6 }
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
        'runway-gen4': 25,
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
        'hailuo-02': 6,
        'kling-v2.1': 5,
        'wan-2.1-i2v-720p': 5,
        'seedance-1-pro': 5,
        'runway-gen4': 5,
        'luma-ray': 6
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
          <source src="/background-video4.mp4" type="video/mp4" />
        </video>
        
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
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
      
      {/* Error Banner with Credit Refund Message */}
      {showErrorBanner && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#f5f5f5',
          color: '#333',
          border: '2px solid #ddd',
          borderRadius: '12px',
          padding: '20px 28px',
          zIndex: 10002,
          width: '500px',
          maxWidth: '90vw',
          fontSize: '1rem',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          backdropFilter: 'blur(8px)',
          animation: 'fadeInScale 0.3s ease-out'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#ff4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ✕
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '8px',
              fontSize: '1.1rem',
              color: '#333'
            }}>
              Generation Failed
            </div>
            <div style={{ 
              opacity: 0.9,
              fontSize: '0.95rem',
              lineHeight: 1.4,
              marginBottom: '16px',
              color: '#555'
            }}>
              {errorBannerMessage}
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={hideErrorBanner}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  border: 'none',
                  background: '#333',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#555'}
                onMouseOut={(e) => e.target.style.background = '#333'}
              >
                OK
              </button>
              <button
                onClick={() => {
                  hideErrorBanner();
                  // Trigger credit refresh
                  if (user) {
                    localStorage.setItem('creditsUpdated', Date.now().toString());
                  }
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  border: '2px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#555',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#999';
                  e.target.style.backgroundColor = '#f9f9f9';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#ccc';
                  e.target.style.backgroundColor = '#fff';
                }}
              >
                Refresh Credits
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'auto', // Changed from hidden to auto to allow scrolling
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column', // Keep column for overall page layout (back button, then content)
      alignItems: 'center',
      justifyContent: 'flex-start', // Changed from center to flex-start to allow content expansion
      backdropFilter: 'blur(2px)',
      position: 'relative',
      marginTop: '-43px', // Move up by 1.5cm (approximately 43px)
      paddingBottom: '50px' // Add padding at bottom to ensure content is not cut off
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          minHeight: '100%', // Cover the full height of the container
          minWidth: '100%'   // Cover the full width of the container
        }}
        src="/background-video4.mp4"
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', // Changed back to absolute to cover the full main container
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1,
        width: '100%',
        height: '100%'
      }} />
      {/* All content below should have zIndex: 2 or higher if needed */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 63, // Increased from 20 to 63 (20 + 43) to compensate for the upward movement
          left: 20,
          zIndex: 2,
          background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Inter, Helvetica, Arial, sans-serif',
          backdropFilter: 'blur(8px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
      >
        ← Back
      </button>
      
      {/* Connected Input-Output Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'row', // Side by side layout
        alignItems: 'center', // Changed from 'flex-start' to 'center' to align output box to middle
        justifyContent: 'center',
        gap: '0', // No gap since they're connected
        maxWidth: '1000px', // Wider container for side-by-side layout
        width: '100%',
        margin: '76px auto 0', // Increased from 38px to 76px (2cm total) to move box down by 1cm
        zIndex: 3,
        position: 'relative'
      }}>
      <div className={type === 'text2video' || type === 'genimage' || type === 'genvideo' ? "generate-box" : "controls-card"} style={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? {
        background: '#0f0f0f',
        borderRadius: '16px 0 0 16px', // Only left rounded corners
        padding: '24px', // Reduced from 32px for compactness
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        width: '480px', // Fixed width for input section
        minHeight: '300px', // Reduced from 400px for more compact layout
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: 'none' // Remove right border to connect
      } : {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px 0 0 12px', // Only left rounded corners
        boxShadow: '0 0 24px rgba(0, 0, 0, 0.15)',
        padding: '24px 28px',
        width: '480px', // Fixed width for input section
        minHeight: '300px', // Reduced from 400px for more compact layout
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: 0,
        backdropFilter: 'blur(8px)',
        borderRight: 'none' // Remove right border to connect
      }}>
        <span style={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? {
          fontSize: '24px', // Reduced from 28px
          fontWeight: '700',
          marginBottom: '8px', // Reduced from 10px
          color: '#ffffff'
        } : {
          fontSize: '1.5rem', // Reduced from 1.6rem
          fontWeight: 600,
          letterSpacing: '0.5px',
          marginBottom: 6, // Reduced from 8
          color: '#000000'
        }}>{tool.title}</span>
        <span style={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? {
          fontSize: '14px', // Reduced from 16px
          color: '#ffffff',
          marginBottom: '12px', // Reduced from 16px
          lineHeight: 1.3 // Reduced from 1.4
        } : { 
          fontSize: '0.9rem', // Reduced from 0.95rem
          fontWeight: 500, 
          color: '#333333', 
          lineHeight: 1.3, // Reduced from 1.4
          opacity: 0.8,
          marginBottom: '12px' // Reduced from 16px
        }}>{tool.desc}</span>
        {credits !== null && (
          <div style={{ 
            fontSize: '0.85rem', // Reduced from 0.9rem
            color: '#000000', 
            marginBottom: 12, // Reduced from 16
            fontWeight: 600,
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            padding: '10px 14px', // Reduced from 12px 16px
            borderRadius: 8,
            marginTop: 6, // Reduced from 8
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
          <div className="credits-info" style={{
            fontSize: '14px',
            color: '#ff4b2b',
            marginBottom: '16px'
          }}>
            <span className="credits-total" style={{
              color: '#4fc3f7',
              fontWeight: '500'
            }}>Total Cost: {totalCost} credits</span>
          </div>
        )}
        {type !== 'text2video' && type === 'text2video' && totalCost !== null && (
          <div style={{ fontSize: '1.05rem', color: '#0070f3', marginBottom: 8, fontWeight: 'bold' }}>
            Total Cost: <b>{totalCost} credits</b>
          </div>
        )}
        {type === 'genvideo' && (
          <div className="credits-info" style={{
            fontSize: '14px',
            color: '#ff4b2b',
            marginBottom: '16px'
          }}>
            <span className="credits-total" style={{
              color: '#4fc3f7',
              fontWeight: '500'
            }}>Total Cost: {totalGenVideoCost} credits</span>
          </div>
        )}
        <div style={{ 
          fontSize: '0.9rem', // Reduced from 0.95rem
          color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#ff4b2b' : '#c00', 
          marginBottom: 12, // Reduced from 16
          fontWeight: 'bold' 
        }}>Credits: <b>{toolCredits}</b></div>
        {(type === 'genvideo') && (
          <div style={{
            marginBottom: 12, // Reduced from 16
            background: (type === 'genvideo') ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            border: (type === 'genvideo') ? 'none' : '1px solid #e0e0e0',
            padding: '12px 16px', // Reduced from 16px 20px
            display: 'flex',
            alignItems: 'center',
            gap: 12, // Reduced from 16
            fontSize: '0.85rem', // Reduced from 0.9rem
            fontWeight: 500,
            color: (type === 'genvideo') ? '#ffffff' : '#000000',
            boxShadow: (type === 'genvideo') ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="videoModel" style={{ fontWeight: 600, marginRight: 8, color: (type === 'genvideo') ? '#ffffff' : '#000000' }}>Model:</label>
            <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: (type === 'genvideo') ? 'none' : '1px solid #e0e0e0', 
              background: (type === 'genvideo') ? '#2a2a2a' : '#ffffff', 
              color: (type === 'genvideo') ? '#ffffff' : '#000000', 
              fontWeight: 500, 
              fontSize: '0.9rem',
              flex: 1
            }}>
              {genvideoModels.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        {(type === 'genvideo' && videoModel === 'luma-ray') && (
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
        {(type === 'text2video') && (
          <div style={{
            marginBottom: 12, // Reduced from 16
            background: type === 'text2video' ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            border: type === 'text2video' ? 'none' : '1px solid #e0e0e0',
            padding: '12px 16px', // Reduced from 16px 20px
            display: 'flex',
            alignItems: 'center',
            gap: 12, // Reduced from 16
            fontSize: '0.85rem', // Reduced from 0.9rem
            fontWeight: 500,
            color: type === 'text2video' ? '#ffffff' : '#000000',
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="videoModel" style={{ fontWeight: 600, marginRight: 8, color: type === 'text2video' ? '#ffffff' : '#000000' }}>Model:</label>
            <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: type === 'text2video' ? 'none' : '1px solid #e0e0e0', 
              background: type === 'text2video' ? '#2a2a2a' : '#ffffff', 
              color: type === 'text2video' ? '#ffffff' : '#000000', 
              fontWeight: 500, 
              fontSize: '0.9rem',
              flex: 1
            }}>
              {text2videoModels.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        {(type === 'image2video') && (
          <div style={{
            marginBottom: 16,
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#000000'
          }}>
            <label htmlFor="videoModel" style={{ fontWeight: 600, marginRight: 8, color: '#000000' }}>Model:</label>
            <select id="videoModel" value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #e0e0e0', 
              background: '#ffffff', 
              color: '#000000', 
              fontWeight: 500, 
              fontSize: '0.9rem',
              flex: 1
            }}>
              {image2videoModels.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        {type === 'genimage' && (
          <div className="aspect-options" style={{
            marginBottom: 16,
            background: (type === 'genimage') ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            border: (type === 'genimage') ? 'none' : '1px solid #e0e0e0',
            padding: '16px 20px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: (type === 'genimage') ? '#ffffff' : '#000000',
            boxShadow: (type === 'genimage') ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label style={{ fontWeight: 600, marginRight: 8, color: (type === 'genimage') ? '#ffffff' : '#000000', marginBottom: '8px', display: 'block' }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {['1:1', '3:4', '4:3', '16:9', '9:16'].map((ratio) => (
                <label key={ratio} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: (type === 'genimage') ? '#ffffff' : '#333333' }}>
                  <input
                    type="radio"
                    name="aspectRatio"
                    value={ratio}
                    checked={aspectRatio === ratio}
                    onChange={() => setAspectRatio(ratio)}
                    style={{ accentColor: (type === 'genimage') ? '#4fc3f7' : '#000000', marginRight: 4 }}
                  />
                  {ratio}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 16 }}> {/* Reduced from 24 */}
              <label htmlFor="prompt" style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, display: 'block', color: (type === 'genimage') ? '#ffffff' : '#000000' }}>Prompt</label> {/* Reduced font and margin */}
              <textarea
                id="prompt"
                placeholder="Describe your scene or image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: '90%',
                  height: '80px', // Reduced from 120px
                  padding: '10px 14px', // Reduced from 12px 16px
                  borderRadius: 8, // Reduced from 10
                  border: blockedWords.length > 0 ? '2px solid #22c55e' : (type === 'genimage' ? 'none' : '1.5px solid #d1d5db'),
                  background: blockedWords.length > 0 ? '#f0fdf4' : (type === 'genimage' ? '#2a2a2a' : '#f3f4f6'),
                  color: type === 'genimage' ? '#ffffff' : '#222',
                  fontWeight: 500,
                  fontSize: '0.85rem', // Reduced from 0.9rem
                  lineHeight: '1.3', // Reduced from 1.4
                  boxShadow: type === 'genimage' ? 'none' : '0 1px 6px rgba(60,60,60,0.08)',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
              {/* Content Warning */}
              {contentWarning && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #22c55e',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  color: '#16a34a',
                  fontWeight: 500,
                  width: '90%'
                }}>
                  ✅ {contentWarning}
                  {blockedWords.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: '0.85rem', fontWeight: 'normal' }}>
                      These words will be automatically replaced with safer alternatives.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {(type === 'text2video') && videoModel === 'hailuo-02' && (
          <div className="aspect-options" style={{
            marginBottom: 12, // Reduced from 18
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 10, // Reduced from 14
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : '0 2px 12px rgba(30,30,40,0.10)',
            padding: '12px 20px', // Reduced from 18px 28px
            fontSize: '0.95rem', // Reduced from 1.08rem
            fontWeight: 600,
            color: type === 'text2video' ? '#ffffff' : '#222',
            border: type === 'text2video' ? 'none' : '1.5px solid #e5e7eb'
          }}>
            <label style={{ fontWeight: 600, marginRight: 8, color: type === 'text2video' ? '#ffffff' : '#222' }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
              {getAspectOptions(type, videoModel).map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: type === 'text2video' ? '#ffffff' : '#222' }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} style={{ accentColor: type === 'text2video' ? '#4fc3f7' : '#6366f1', marginRight: 4 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {(type === 'text2video') && (videoModel === 'veo-3-fast' || videoModel === 'veo-3') && (
          <div className="aspect-options" style={{
            marginBottom: 18,
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 14,
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : '0 2px 12px rgba(30,30,40,0.10)',
            padding: '18px 28px',
            fontSize: '1.08rem',
            fontWeight: 600,
            color: type === 'text2video' ? '#ffffff' : '#222',
            border: type === 'text2video' ? 'none' : '1.5px solid #e5e7eb'
          }}>
            <label style={{ fontWeight: 600, marginRight: 8, color: type === 'text2video' ? '#ffffff' : '#222' }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
              {getAspectOptions(type, videoModel).map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: type === 'text2video' ? '#ffffff' : '#222' }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} style={{ accentColor: type === 'text2video' ? '#4fc3f7' : '#6366f1', marginRight: 4 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {(type === 'text2video') && videoModel === 'luma-ray' && (
          <div className="aspect-options" style={{
            marginBottom: 18,
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 14,
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : '0 2px 12px rgba(30,30,40,0.10)',
            padding: '18px 28px',
            fontSize: '1.08rem',
            fontWeight: 600,
            color: type === 'text2video' ? '#ffffff' : '#222',
            border: type === 'text2video' ? 'none' : '1.5px solid #e5e7eb'
          }}>
            <label style={{ fontWeight: 600, marginRight: 8, color: type === 'text2video' ? '#ffffff' : '#222' }}>Aspect Ratio:</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
              {getAspectOptions(type, videoModel).map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: type === 'text2video' ? '#ffffff' : '#222' }}>
                  <input type="radio" name="aspectRatio" value={opt.value} checked={aspectRatio === opt.value} onChange={() => setAspectRatio(opt.value)} style={{ accentColor: type === 'text2video' ? '#4fc3f7' : '#6366f1', marginRight: 4 }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {(type === 'text2video') && videoModel === 'hailuo-02' && (
          <div className="duration-options" style={{ 
            marginBottom: 18,
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 14,
            padding: '18px 28px',
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="duration" style={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              marginBottom: 6, 
              display: 'block',
              color: type === 'text2video' ? '#ffffff' : '#222'
            }}>Duration (seconds)</label>
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
                    background: duration === val ? 'linear-gradient(90deg,#ffb347 0%,#ff3b3b 100%)' : (type === 'text2video' ? '#2a2a2a' : '#f7f7f7'),
                    color: duration === val ? '#fff' : (type === 'text2video' ? '#ffffff' : '#222'),
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
        {(type === 'text2video') && videoModel === 'luma-ray' && (
          <div className="duration-options" style={{ 
            marginBottom: 18,
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 14,
            padding: '18px 28px',
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="duration" style={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              marginBottom: 6, 
              display: 'block',
              color: type === 'text2video' ? '#ffffff' : '#222'
            }}>Duration (seconds)</label>
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
                    background: duration === val ? 'linear-gradient(90deg,#ffb347 0%,#ff3b3b 100%)' : (type === 'text2video' ? '#2a2a2a' : '#f7f7f7'),
                    color: duration === val ? '#fff' : (type === 'text2video' ? '#ffffff' : '#222'),
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
          <div className="duration-options" style={{ 
            marginBottom: 12, // Reduced from 18
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 10, // Reduced from 14
            padding: '12px 20px', // Reduced from 18px 28px
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="duration" style={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              marginBottom: 6, 
              display: 'block',
              color: type === 'text2video' ? '#ffffff' : '#222'
            }}>Duration (seconds)</label>
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
                    background: duration === val ? 'linear-gradient(90deg,#ffb347 0%,#ff3b3b 100%)' : (type === 'text2video' ? '#2a2a2a' : '#f7f7f7'),
                    color: duration === val ? '#fff' : (type === 'text2video' ? '#ffffff' : '#222'),
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
            <p style={{ 
              fontSize: '0.85rem', 
              color: type === 'text2video' ? '#999' : '#666', 
              marginTop: '8px', 
              fontStyle: 'italic' 
            }}>
              Veo models generate high-quality 8-second videos
            </p>
          </div>
        )}
        {(type === 'genvideo') && (videoModel === 'hailuo-02' || videoModel === 'kling-v2.1' || videoModel === 'wan-2.1-i2v-720p' || videoModel === 'seedance-1-pro' || videoModel === 'runway-gen4') && (
          <div className="duration-options" style={{ 
            marginBottom: 12, // Reduced from 18
            background: type === 'genvideo' ? '#1a1a1a' : '#fff',
            borderRadius: 10, // Reduced from 14
            padding: '12px 20px', // Reduced from 18px 28px
            boxShadow: type === 'genvideo' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="duration" style={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              marginBottom: 6, 
              display: 'block',
              color: type === 'genvideo' ? '#ffffff' : '#222'
            }}>Duration (seconds)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(videoModel === 'hailuo-02' ? [6, 10] :
                videoModel === 'kling-v2.1' ? [5, 10] :
                videoModel === 'wan-2.1-i2v-720p' ? [5, 10] :
                videoModel === 'seedance-1-pro' ? [5, 10] :
                videoModel === 'runway-gen4' ? [5, 10] :
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
                    background: duration === val ? 'linear-gradient(90deg,#ffb347 0%,#ff3b3b 100%)' : (type === 'genvideo' ? '#2a2a2a' : '#f7f7f7'),
                    color: duration === val ? '#fff' : (type === 'genvideo' ? '#ffffff' : '#222'),
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
          <div style={{ 
            marginBottom: 12, // Reduced from 18
            background: type === 'text2video' ? '#1a1a1a' : '#fff',
            borderRadius: 10, // Reduced from 14
            padding: '12px 20px', // Reduced from 18px 28px
            boxShadow: type === 'text2video' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="prompt" style={{ 
              fontWeight: 600, // Reduced from 700
              fontSize: '0.95rem', // Reduced from 1rem
              marginBottom: 4, // Reduced from 6
              display: 'block',
              color: type === 'text2video' ? '#ffffff' : '#222'
            }}>Prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2} // Reduced from 3
              style={{ 
                width: '100%', 
                marginTop: 4, // Reduced from 6
                padding: 10, // Reduced from 12
                borderRadius: 6, // Reduced from 8
                border: blockedWords.length > 0 ? '2px solid #22c55e' : (type === 'text2video' ? 'none' : '1px solid #ccc'), 
                fontSize: '0.9rem', // Reduced from 1rem
                backgroundColor: blockedWords.length > 0 ? '#f0fdf4' : (type === 'text2video' ? '#2a2a2a' : 'white'),
                color: type === 'text2video' ? '#ffffff' : '#222',
                resize: 'vertical',
                outline: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
              placeholder="Describe your scene or image..."
            />
            {/* Content Warning */}
            {contentWarning && (
              <div style={{
                marginTop: 8,
                padding: '10px 14px',
                backgroundColor: type === 'text2video' ? '#2a4d2a' : '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: 8,
                fontSize: '0.9rem',
                color: '#16a34a',
                fontWeight: 500
              }}>
                ✅ {contentWarning}
                {blockedWords.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.85rem', fontWeight: 'normal' }}>
                    These words will be automatically replaced with safer alternatives.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {type === 'genvideo' && (
          <div style={{ 
            marginBottom: 12, // Reduced from 18
            background: type === 'genvideo' ? '#1a1a1a' : '#fff',
            borderRadius: 10, // Reduced from 14
            padding: '12px 20px', // Reduced from 18px 28px
            boxShadow: type === 'genvideo' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="prompt" style={{ 
              fontWeight: 600, // Reduced from 700
              fontSize: '0.95rem', // Reduced from 1rem
              marginBottom: 4, // Reduced from 6
              display: 'block',
              color: type === 'genvideo' ? '#ffffff' : '#222'
            }}>Prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2} // Reduced from 3
              style={{ 
                width: '100%', 
                marginTop: 4, // Reduced from 6
                padding: 10, // Reduced from 12
                borderRadius: 6, // Reduced from 8
                border: blockedWords.length > 0 ? '2px solid #22c55e' : (type === 'genvideo' ? 'none' : '1px solid #ccc'), 
                fontSize: '0.9rem', // Reduced from 1rem
                backgroundColor: blockedWords.length > 0 ? '#f0fdf4' : (type === 'genvideo' ? '#2a2a2a' : 'white'),
                color: type === 'genvideo' ? '#ffffff' : '#222',
                resize: 'vertical',
                outline: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
              placeholder="Describe your scene or image..."
            />
            {/* Content Warning */}
            {contentWarning && (
              <div style={{
                marginTop: 8,
                padding: '10px 14px',
                backgroundColor: type === 'genvideo' ? '#2a4d2a' : '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: 8,
                fontSize: '0.9rem',
                color: '#16a34a',
                fontWeight: 500
              }}>
                ✅ {contentWarning}
                {blockedWords.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.85rem', fontWeight: 'normal' }}>
                    These words will be automatically replaced with safer alternatives.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {type === 'genvideo' && (
          <div style={{
            marginBottom: 18,
            background: type === 'genvideo' ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            border: type === 'genvideo' ? 'none' : '1px solid #e0e0e0',
            padding: '16px 20px',
            boxShadow: type === 'genvideo' ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            <label htmlFor="file" style={{ 
              fontWeight: 600, 
              fontSize: '1rem', 
              marginBottom: 8, 
              display: 'block',
              color: type === 'genvideo' ? '#ffffff' : '#000000'
            }}>Upload Image:</label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={e => {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);
                // Clear any previous generation result when uploading new file
                setPreviewUrl('');
                if (selectedFile) {
                  // Clean up previous preview URL
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }
                  // Create new preview URL
                  const newPreviewUrl = URL.createObjectURL(selectedFile);
                  setImagePreviewUrl(newPreviewUrl);
                } else {
                  // Clean up preview URL if no file selected
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }
                  setImagePreviewUrl('');
                }
              }}
              style={{ 
                width: '100%',
                padding: '12px 16px', 
                borderRadius: 8, 
                border: type === 'genvideo' ? 'none' : '1px solid #e0e0e0', 
                backgroundColor: type === 'genvideo' ? '#2a2a2a' : '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: type === 'genvideo' ? '#ffffff' : '#000000',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
            />
            {/* Image Preview */}
            {imagePreviewUrl && (
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: 12, 
                  fontSize: '0.9rem', 
                  color: type === 'genvideo' ? '#ffffff' : '#000000' 
                }}>
                  Preview:
                </div>
                <div style={{
                  border: type === 'genvideo' ? 'none' : '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 12,
                  background: type === 'genvideo' ? '#2a2a2a' : '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img
                    src={imagePreviewUrl}
                    alt="Upload preview"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      width: 'auto',
                      height: 'auto',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
                {file && (
                  <div style={{ 
                    marginTop: 12, 
                    fontSize: '0.85rem', 
                    color: '#666666',
                    textAlign: 'center',
                    fontWeight: 500
                  }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}
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
            {isAsyncGeneration ? (
              <div>
                <div style={{ fontSize: '1.08rem', color: '#444', fontWeight: 600, marginBottom: 8 }}>
                  Progress: {asyncGeneration.progress}%
                </div>
                <div style={{ 
                  width: '100%', 
                  height: 8, 
                  backgroundColor: '#eee', 
                  borderRadius: 4, 
                  marginTop: 8,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: `${asyncGeneration.progress}%`,
                    height: '100%',
                    backgroundColor: asyncGeneration.progress < 95 ? '#4CAF50' : '#FF9800',
                    transition: 'width 0.5s ease',
                    borderRadius: 4
                  }} />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.08rem', color: '#444', fontWeight: 600, marginBottom: 8 }}>
                  Progress: {Math.round(syncProgress)}%
                </div>
                <div style={{ 
                  width: '100%', 
                  height: 8, 
                  backgroundColor: '#eee', 
                  borderRadius: 4, 
                  marginTop: 8,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: `${syncProgress}%`,
                    height: '100%',
                    backgroundColor: syncProgress < 95 ? '#4CAF50' : '#FF9800',
                    transition: 'width 0.3s ease',
                    borderRadius: 4
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
        {(tool.inputType !== 'none') && (
          <Button
            onClick={hasEnoughCredits && !isGenerating ? handleGenerate : undefined}
            className="creative-btn"
            disabled={!hasEnoughCredits || loading || isGenerating}
            style={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? {
              background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
              color: '#000',
              border: 'none',
              padding: '14px 26px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: hasEnoughCredits && !loading ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 20,
              opacity: hasEnoughCredits && !loading ? 1 : 0.6
            } : {
              marginTop: 20,
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px 24px',
              borderRadius: '8px',
              letterSpacing: '0.02em',
              boxShadow: 'none',
              border: 'none',
              cursor: hasEnoughCredits && !loading ? 'pointer' : 'not-allowed',
              background: hasEnoughCredits && !loading ? '#000000' : '#f5f5f5',
              color: hasEnoughCredits && !loading ? '#ffffff' : '#999999',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              opacity: hasEnoughCredits && !loading ? 1 : 0.8
            }}
            onMouseOver={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? (e) => e.target.style.transform = 'scale(1.03)' : undefined}
            onMouseOut={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? (e) => e.target.style.transform = 'scale(1)' : undefined}
          >
            <span style={{
              display: 'inline-block',
              color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#000' : (hasEnoughCredits && !loading ? '#ffffff' : '#999999'),
              fontWeight: 600,
              fontSize: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '16px' : '0.9rem',
              letterSpacing: '0.5px'
            }}>
              {!hasEnoughCredits ? 'Insufficient Credits' : 'Generate'}
            </span>
            {!(type === 'text2video' || type === 'genimage' || type === 'genvideo') && (
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
            )}
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
      
      {/* Connected Output Section - Right Side */}
      <div style={{
        padding: '24px', // Reduced from 32px for compactness
        borderRadius: '0 16px 16px 0', // Only rounded right corners
        background: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#1a1a1a' : '#f8f8f8', // Slightly different shade for visual separation
        border: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e0e0e0',
        borderLeft: 'none', // Remove left border to connect with input box
        boxShadow: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '0 0 30px rgba(0, 0, 0, 0.8)' : '0 0 24px rgba(0, 0, 0, 0.15)', // Continue the shadow from input box
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px', // Match input box height - reduced for compactness
        fontFamily: "'Inter', sans-serif",
        width: '480px', // Match input box width
        backdropFilter: 'blur(8px)'
      }}>
        <h3 style={{ 
          color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#ffffff' : '#333',
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '16px',
          marginTop: '0'
        }}>
          Output
        </h3>
        {loading ? (
          // Always show loading state when generating, regardless of previous results
          <div style={{ color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#ffffff' : '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Loading Spinner */}
              <div style={{
                width: 60,
                height: 60,
                border: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '4px solid #333' : '4px solid #f3f3f3',
                borderTop: '4px solid #ff3b3b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#ffffff' : '#444' }}>
                {type === 'genimage' ? 'Generating your image...' : 'Generating your video...'}
              </div>
              {type !== 'genimage' && (
                <div style={{ fontSize: '0.9rem', color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#cccccc' : '#666', textAlign: 'center', maxWidth: '300px' }}>
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
          <div style={{
            background: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#1a1a1a' : 'transparent',
            borderRadius: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '16px' : '0',
            padding: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '24px' : '0',
            boxShadow: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '0 4px 15px rgba(0, 0, 0, 0.5)' : 'none'
          }}>
            {(type === 'text2video' || type === 'genvideo') ? (
              <video 
                src={previewUrl} 
                controls 
                style={{ 
                  maxWidth: '90%', 
                  maxHeight: '60vh', 
                  borderRadius: '12px', 
                  boxShadow: (type === 'text2video' || type === 'genvideo') ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)', 
                  marginBottom: 18 
                }} 
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="Generated Preview" 
                style={{ 
                  maxWidth: '90%', 
                  maxHeight: '60vh', 
                  borderRadius: '12px', 
                  boxShadow: (type === 'genimage') ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)', 
                  marginBottom: 18 
                }} 
              />
            )}
            <button 
              onClick={handleDownload} 
              style={{ 
                display: 'inline-block', 
                fontSize: '1.08rem', 
                padding: '12px 32px', 
                borderRadius: '8px', 
                backgroundColor: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#ffffff' : '#1a1a1a', 
                color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#000000' : '#fff', 
                fontWeight: 'bold', 
                marginTop: 18, 
                boxShadow: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '0 2px 8px rgba(255,255,255,0.15)' : '0 2px 8px rgba(0,0,0,0.15)', 
                border: 'none', 
                cursor: 'pointer', 
                letterSpacing: '1px', 
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseOver={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? (e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#f0f0f0';
              } : undefined}
              onMouseOut={(type === 'text2video' || type === 'genimage' || type === 'genvideo') ? (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#ffffff';
              } : undefined}
            >
              Download
            </button>
          </div>
        ) : (
          // Show placeholder when no result and not loading
          <div style={{ color: (type === 'text2video' || type === 'genimage' || type === 'genvideo') ? '#cccccc' : '#888', fontSize: '1.1rem', textAlign: 'center', marginTop: 80 }}>
            Your generated content will appear here
          </div>
        )}
      </div>
      
      {/* End Connected Input-Output Container */}
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </main>
    </>
  );
// End of main return block
}