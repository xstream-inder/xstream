'use client';

import { PLAYBACK_SPEEDS, type QualityLevel } from './use-video-player';

interface VideoControlsProps {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  buffered: number;
  playbackSpeed: number;
  qualities: QualityLevel[];
  currentQuality: number;
  showQualityMenu: boolean;
  showSpeedMenu: boolean;

  // Refs
  progressBarRef: React.RefObject<HTMLDivElement | null>;

  // Handlers
  togglePlay: () => void;
  toggleVolume: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  toggleFullscreen: () => void;
  handleQualityChange: (levelIndex: number) => void;
  handleSpeedChange: (speed: number) => void;
  skip: (seconds: number) => void;
  setShowQualityMenu: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowSpeedMenu: (value: boolean | ((prev: boolean) => boolean)) => void;
  formatTime: (time: number) => string;
}

export function VideoControls({
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
  progressBarRef,
  togglePlay,
  toggleVolume,
  handleVolumeChange,
  handleSeek,
  toggleFullscreen,
  handleQualityChange,
  handleSpeedChange,
  skip,
  setShowQualityMenu,
  setShowSpeedMenu,
  formatTime,
}: VideoControlsProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="w-full h-2 sm:h-1.5 bg-gray-600 cursor-pointer rounded-full mb-4 relative sm:hover:h-2.5 transition-all group/progress py-2 -my-2 sm:py-0 sm:my-0 bg-clip-content"
        onClick={handleSeek}
        role="slider"
        tabIndex={0}
        aria-label="Video progress"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); skip(-5); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); skip(5); }
        }}
      >
        <div
          className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
          style={{ width: `${buffered}%` }}
        />
        <div
          className="absolute top-0 left-0 h-full bg-xred-600 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 -top-1 w-3 h-3 bg-xred-600 rounded-full opacity-0 group-hover/progress:opacity-100 shadow transform scale-150" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-xred-500 transition-colors p-2"
            title={isPlaying ? 'Pause (k)' : 'Play (k)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Buttons */}
          <button
            onClick={() => skip(-10)}
            className="text-white hover:text-gray-300 hidden sm:block"
            title="Rewind 10s (Left Arrow)"
            aria-label="Rewind 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12.5 8h-6.75M8 6l-2.25 2L8 10M12.5 16h6.75M16 14l2.25 2L16 18"
                transform="scale(-1, 1) translate(-24, 0)"
              />
              <text x="8" y="15" fontSize="8" fill="currentColor" textAnchor="middle">
                -10
              </text>
            </svg>
          </button>
          <button
            onClick={() => skip(10)}
            className="text-white hover:text-gray-300 hidden sm:block"
            title="Forward 10s (Right Arrow)"
            aria-label="Forward 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.5 8h6.75M16 6l2.25 2L16 10M11.5 16h-6.75M8 14l-2.25 2L8 18"
              />
              <text x="16" y="15" fontSize="8" fill="currentColor" textAnchor="middle">
                10
              </text>
            </svg>
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 group/volume">
            <button
              onClick={toggleVolume}
              className="text-white hover:text-gray-300 p-2"
              title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              className="w-0 overflow-hidden group-hover/volume:w-20 transition-all h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer accent-xred-600"
            />
          </div>

          {/* Time */}
          <div className="text-white text-xs sm:text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Speed Selector */}
          <div className="relative menu-container">
            <button
              onClick={() => {
                setShowSpeedMenu((prev: boolean) => !prev);
                setShowQualityMenu(false);
              }}
              className="text-white hover:text-xred-500 text-sm font-semibold w-8 text-center"
              title="Playback Speed"
              aria-label={`Playback speed ${playbackSpeed}x`}
              aria-haspopup="true"
              aria-expanded={showSpeedMenu}
            >
              {playbackSpeed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[80px] shadow-xl z-30" role="menu">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    role="menuitem"
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${
                      playbackSpeed === speed ? 'text-xred-500 font-bold' : 'text-gray-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quality Selector */}
          {qualities.length > 0 && (
            <div className="relative menu-container">
              <button
                onClick={() => {
                  setShowQualityMenu((prev: boolean) => !prev);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1 text-white hover:text-xred-500 text-sm font-semibold border border-white/20 px-2 py-0.5 rounded"
                title="Quality"
                aria-label={`Quality: ${currentQuality === -1 ? 'Auto' : qualities.find((q) => q.levelIndex === currentQuality)?.label}`}
                aria-haspopup="true"
                aria-expanded={showQualityMenu}
              >
                {currentQuality === -1
                  ? 'Auto'
                  : qualities.find((q) => q.levelIndex === currentQuality)?.label}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[120px] shadow-xl z-30" role="menu">
                  {qualities.map((q) => (
                    <button
                      key={q.levelIndex}
                      onClick={() => handleQualityChange(q.levelIndex)}
                      role="menuitem"
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${
                        currentQuality === q.levelIndex
                          ? 'text-xred-500 font-bold'
                          : 'text-gray-300'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-xred-500 transition-colors p-2"
            title="Fullscreen (f)"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
