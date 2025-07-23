import { useState, useEffect } from 'react';

export function useAsyncGeneration(predictionId, onComplete, onError) {
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    if (!predictionId) {
      console.log(`🔍 useAsyncGeneration: Hook loaded but no predictionId yet - waiting for generation to start`);
      return;
    }
    
    console.log(`📡 *** STARTING TO MONITOR ASYNC GENERATION *** ${predictionId}`);
    console.log(`🔧 Hook initialized with predictionId: ${predictionId}`);
    
    const startTime = Date.now();
    let progressInterval;
    let statusInterval;
    
    // Update time elapsed every second
    const timeInterval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Simulate progress for better UX (not real progress from API)
    progressInterval = setInterval(() => {
      setProgress(prev => {
        // Much slower, more realistic progress simulation for long-running models
        if (prev < 10) return prev + 1; // Very slow start
        if (prev < 30) return prev + 0.5; // Slow early progress
        if (prev < 60) return prev + 0.3; // Slower middle
        if (prev < 85) return prev + 0.2; // Very slow near end
        return Math.min(prev + 0.1, 93); // Crawl to 93% max
      });
    }, 4000); // Update every 4 seconds for much slower progress
    
    // Check status every 5 seconds (longer interval for long-running models)
    statusInterval = setInterval(async () => {
      try {
        console.log(`🔍 [${new Date().toISOString()}] Frontend checking status for ${predictionId}... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
        console.log(`🔧 About to fetch: /api/generation-status?id=${predictionId}`);
        
        // Get current session token for authentication
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          console.log(`🔧 Adding auth header for status check (token length: ${session.access_token.length})`);
        } else {
          console.warn(`⚠️ No session token available for status check`);
        }
        
        console.log(`🔧 Request headers:`, Object.keys(headers));
        
        const response = await fetch(`/api/generation-status?id=${predictionId}`, {
          headers
        });
        
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          console.error(`❌ Status check HTTP error:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
          
          // Try to get error details
          try {
            const errorText = await response.text();
            console.error(`❌ Error response body:`, errorText);
          } catch (e) {
            console.error(`❌ Could not read error response:`, e);
          }
          return; // Don't parse JSON on error
        }
        
        const data = await response.json();
        console.log(`📊 Status response:`, data);
        
        if (response.ok) {
          console.log(`📊 Status update: ${data.status} (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
          setStatus(data.status);
          
          if (data.status === 'succeeded') {
            console.log(`✅ Generation completed: ${predictionId}`);
            console.log(`✅ Final result:`, data);
            console.log(`🔧 About to call onComplete with data:`, data);
            console.log(`🔧 data.output value:`, data.output);
            console.log(`🔧 onComplete function exists:`, typeof onComplete === 'function');
            
            setProgress(100);
            setResult(data);
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            clearInterval(timeInterval);
            
            if (typeof onComplete === 'function') {
              console.log(`🔧 Calling onComplete callback now...`);
              onComplete(data);
              console.log(`🔧 onComplete callback finished`);
            } else {
              console.warn(`⚠️ onComplete is not a function:`, onComplete);
            }
          } else if (data.status === 'failed') {
            console.log(`❌ Generation failed: ${predictionId} - Error: ${data.error || 'Unknown error'}`);
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            clearInterval(timeInterval);
            
            // Trigger credit refresh if refunded
            if (data.refunded) {
              console.log('💰 Credits were refunded, triggering refresh');
              localStorage.setItem('creditsUpdated', Date.now().toString());
            }
            
            onError?.(data.error || 'Generation failed');
          } else {
            console.log(`⏳ Still ${data.status}... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
          }
        } else {
          console.error('❌ Status check failed:', data.error);
          console.error('❌ Response status:', response.status);
          console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
          console.error('❌ This could trigger the fallback after repeated failures!');
        }
      } catch (error) {
        console.error('❌ Error checking status:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          predictionId,
          timeElapsed: Math.floor((Date.now() - startTime) / 1000)
        });
        console.error('❌ This could trigger the fallback after repeated failures!');
        
        // Don't immediately error out - let it retry a few times
        // Only error after extended failures
        const timeElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (timeElapsedSeconds > 900) { // 15 minutes timeout
          console.error('❌ TIMEOUT: Generation took too long, stopping monitoring');
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          clearInterval(timeInterval);
          onError?.('Generation timed out after 15 minutes');
        }
      }
    }, 5000); // 5 second intervals for long-running tasks
    
    return () => {
      console.log(`🛑 Stopping monitoring for ${predictionId}`);
      clearInterval(timeInterval);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [predictionId, onComplete, onError]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getEstimatedTimeRemaining = () => {
    // No time estimates - just show processing status
    return "Processing...";
  };
  
  return {
    status,
    progress: Math.round(progress),
    timeElapsed: formatTime(timeElapsed),
    timeElapsedSeconds: timeElapsed,
    estimatedTimeRemaining: getEstimatedTimeRemaining(),
    isProcessing: status === 'processing' || status === 'starting',
    isCompleted: status === 'succeeded',
    isFailed: status === 'failed',
    result
  };
}
