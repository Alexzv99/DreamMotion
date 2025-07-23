import { useState, useEffect } from 'react';

export function useAsyncGeneration(predictionId, onComplete, onError) {
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  useEffect(() => {
    if (!predictionId) return;
    
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
        // Slow progress that approaches but never reaches 100%
        const increment = (100 - prev) * 0.02; // 2% of remaining
        return Math.min(prev + increment, 95);
      });
    }, 1000);
    
    // Check status every 3 seconds
    statusInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generation-status?id=${predictionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus(data.status);
          
          if (data.status === 'succeeded') {
            setProgress(100);
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            clearInterval(timeInterval);
            onComplete?.(data);
          } else if (data.status === 'failed') {
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            clearInterval(timeInterval);
            onError?.(data.error || 'Generation failed');
          }
        } else {
          console.error('Status check failed:', data.error);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 3000);
    
    return () => {
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
  
  return {
    status,
    progress: Math.round(progress),
    timeElapsed: formatTime(timeElapsed),
    isProcessing: status === 'processing' || status === 'starting'
  };
}
