'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export interface QualityLevel {
  height: number;
  levelIndex: number; // -1 for Auto
  label: string;
}

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface UseVideoPlayerOptions {
  hlsUrl: string;
}

export function useVideoPlayer({ hlsUrl }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Menus State
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Error/buffering State
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setShowQualityMenu(false);
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleVolume = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.muted ? 0 : videoRef.current.volume || 1);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleVolume();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  // Setup HLS
  const initHls = (video: HTMLVideoElement) => {
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels
          .map((level, index) => ({
            height: level.height,
            levelIndex: index,
            label: `${level.height}p`,
          }))
          .sort((a, b) => b.height - a.height);

        setQualities([{ height: 0, levelIndex: -1, label: 'Auto' }, ...levels]);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Stream error');
          hls.destroy();
        }
      });

      return hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }
    return null;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = initHls(video);
    return () => {
      hls?.destroy();
    };
  }, [hlsUrl]);

  const handleRetry = () => {
    setError(null);
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) hlsRef.current.destroy();
    initHls(video);
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) setDuration(videoRef.current.duration);

      if (videoRef.current.buffered.length > 0) {
        setBuffered(
          (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) /
            videoRef.current.duration) *
            100
        );
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    // Refs
    videoRef,
    containerRef,
    progressBarRef,

    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    buffered,
    playbackSpeed,
    qualities,
    currentQuality,
    showQualityMenu,
    showSpeedMenu,
    error,
    isBuffering,

    // Handlers
    togglePlay,
    toggleVolume,
    handleVolumeChange,
    handleSeek,
    toggleFullscreen,
    handleQualityChange,
    handleSpeedChange,
    handleRetry,
    skip,
    handleMouseMove,
    onTimeUpdate,
    setIsPlaying,
    setIsBuffering,
    setShowQualityMenu,
    setShowSpeedMenu,
    formatTime,
  };
}
