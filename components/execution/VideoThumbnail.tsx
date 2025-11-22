/**
 * VideoThumbnail Component
 * Generates and displays thumbnail from video first frame
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * VideoThumbnail component props
 */
interface VideoThumbnailProps {
  videoUrl: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
  showPlayIcon?: boolean;
}

/**
 * VideoThumbnail component
 * Generates thumbnail from video first frame and displays with loading placeholder
 */
export function VideoThumbnail({
  videoUrl,
  alt = 'Video thumbnail',
  className,
  onClick,
  showPlayIcon = true,
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate thumbnail from video first frame
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const handleLoadedData = () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw first frame to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError(true);
          setIsLoading(false);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailUrl(dataUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Thumbnail generation error:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Load video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      
      // Cleanup data URL
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div
      className={cn(
        'relative bg-muted rounded-lg overflow-hidden',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {/* Hidden video element for thumbnail generation */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Error placeholder */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <div className="text-muted-foreground text-sm">
              Failed to load thumbnail
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail image */}
      {thumbnailUrl && !isLoading && !error && (
        <>
          <img
            src={thumbnailUrl}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Play icon overlay */}
          {showPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
              <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
                <Play className="h-6 w-6 text-black" fill="black" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
