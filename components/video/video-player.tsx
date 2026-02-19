'use client';

import { useVideoPlayer } from './use-video-player';
import { VideoControls } from './video-controls';

interface VideoPlayerProps {
  hlsUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  vastTagUrl?: string;
  previewUrl?: string | null;
}

export function VideoPlayer({ hlsUrl, thumbnailUrl }: VideoPlayerProps) {
  const player = useVideoPlayer({ hlsUrl });

  return (
    <div
      ref={player.containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
      onMouseMove={player.handleMouseMove}
      onMouseLeave={() => player.handleMouseMove()}
      onDoubleClick={player.toggleFullscreen}
    >
      <video
        ref={player.videoRef}
        className="w-full h-full cursor-pointer"
        onClick={player.togglePlay}
        poster={thumbnailUrl || undefined}
        onTimeUpdate={player.onTimeUpdate}
        onPlay={() => player.setIsPlaying(true)}
        onPause={() => player.setIsPlaying(false)}
        onWaiting={() => player.setIsBuffering(true)}
        onCanPlay={() => player.setIsBuffering(false)}
        onPlaying={() => player.setIsBuffering(false)}
        playsInline
      />

      {/* Buffering Spinner */}
      {player.isBuffering && player.isPlaying && !player.error && (
        <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error with Retry */}
      {player.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-4">
          <p className="text-white bg-red-600/80 px-4 py-2 rounded">{player.error}</p>
          <button
            onClick={player.handleRetry}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Big Play Button Overlay */}
      {!player.isPlaying && !player.error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={player.togglePlay}
        >
          <div className="w-16 h-16 bg-xred-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls */}
      <VideoControls
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        isFullscreen={player.isFullscreen}
        showControls={player.showControls}
        buffered={player.buffered}
        playbackSpeed={player.playbackSpeed}
        qualities={player.qualities}
        currentQuality={player.currentQuality}
        showQualityMenu={player.showQualityMenu}
        showSpeedMenu={player.showSpeedMenu}
        progressBarRef={player.progressBarRef}
        togglePlay={player.togglePlay}
        toggleVolume={player.toggleVolume}
        handleVolumeChange={player.handleVolumeChange}
        handleSeek={player.handleSeek}
        toggleFullscreen={player.toggleFullscreen}
        handleQualityChange={player.handleQualityChange}
        handleSpeedChange={player.handleSpeedChange}
        skip={player.skip}
        setShowQualityMenu={player.setShowQualityMenu}
        setShowSpeedMenu={player.setShowSpeedMenu}
        formatTime={player.formatTime}
      />
    </div>
  );
}
