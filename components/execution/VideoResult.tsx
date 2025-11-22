/**
 * VideoResult Component
 * Displays generated video with player controls, metadata, and download functionality
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoThumbnail } from './VideoThumbnail';

/**
 * Video metadata interface
 */
export interface VideoMetadata {
  duration?: number;
  resolution?: string;
  fileSize?: number;
  filename?: string;
}

/**
 * VideoResult component props
 */
interface VideoResultProps {
  videoUrl: string;
  metadata?: VideoMetadata;
  className?: string;
  autoPlay?: boolean;
}

/**
 * VideoResult component
 * Implements HTML5 video player with custom controls, metadata display, and download
 */
export function VideoResult({
  videoUrl,
  metadata,
  className,
  autoPlay = false,
}: VideoResultProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);

  // Load video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isPlaying) return;

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      setShowThumbnail(false);
    }
  };

  // Mute/Unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Seek video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Download video
  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata?.filename || `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={cn('flex flex-col gap-2 sm:gap-3', className)}>
      {/* Video Player Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black rounded-lg overflow-hidden group',
          isFullscreen && 'fixed inset-0 z-50 rounded-none'
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseMove={() => setShowControls(true)}
        onTouchStart={() => setShowControls(true)}
      >
        {/* Thumbnail (shown before video loads or plays) */}
        {showThumbnail && !autoPlay && (
          <div className="absolute inset-0">
            <VideoThumbnail
              videoUrl={videoUrl}
              className="w-full h-full"
              onClick={togglePlay}
              showPlayIcon={true}
            />
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn('w-full h-auto', showThumbnail && !autoPlay && 'invisible')}
          autoPlay={autoPlay}
          playsInline
          onClick={togglePlay}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Play/Pause Overlay (center) */}
        {!isLoading && !isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
              <Play className="h-8 w-8 text-black" fill="black" />
            </div>
          </button>
        )}

        {/* Controls Overlay - Touch-friendly */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300',
            'p-2 sm:p-3 md:p-4',
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress Bar - Touch-friendly */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={cn(
              "w-full rounded-lg appearance-none cursor-pointer touch-manipulation",
              "h-1 sm:h-1.5 mb-2 sm:mb-3 bg-white/30",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
              "[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
            )}
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          />

          {/* Control Buttons - Responsive layout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play/Pause Button - Touch-friendly */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-white hover:bg-white/20 touch-manipulation"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              )}
            </Button>

            {/* Time Display - Responsive text */}
            <span className="text-[10px] sm:text-xs text-white font-mono whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Volume Control - Hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-white hover:bg-white/20"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                aria-label="Volume control"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={volume}
              />
            </div>

            {/* Mobile volume button only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="sm:hidden h-8 w-8 p-0 text-white hover:bg-white/20 touch-manipulation"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            {/* Fullscreen Button - Touch-friendly */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-white hover:bg-white/20 touch-manipulation"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Maximize className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Metadata - Responsive layout */}
      {metadata && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground">
            {metadata.duration && (
              <span className="whitespace-nowrap">
                Duration: {formatTime(metadata.duration)}
              </span>
            )}
            {metadata.resolution && (
              <span className="whitespace-nowrap">
                Resolution: {metadata.resolution}
              </span>
            )}
            {metadata.fileSize && (
              <span className="whitespace-nowrap">
                Size: {formatFileSize(metadata.fileSize)}
              </span>
            )}
          </div>

          {/* Download Button - Touch-friendly */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-9 sm:h-8 w-full sm:w-auto touch-manipulation"
            aria-label={`Download video ${metadata?.filename || 'file'}`}
          >
            <Download className="h-3 w-3 sm:mr-1" aria-hidden="true" />
            <span className="ml-1 sm:ml-0">Download</span>
          </Button>
        </div>
      )}
    </div>
  );
}
