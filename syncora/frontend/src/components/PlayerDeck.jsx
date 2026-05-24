import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, Radio, Music2, Youtube, ExternalLink, Tv2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/moods';
import VisualizerWaveform from './VisualizerWaveform';
import MiniVideoPlayer from './MiniVideoPlayer';

export default function PlayerDeck() {
  const {
    playingTrack, isPlaying, progress, duration, volume, setVolume,
    muted, setMuted, toggle, next, prev, seek, engine, loading, error,
  } = usePlayer();

  const [miniPlayer, setMiniPlayer] = useState(null);

  const openMiniPlayer = () => setMiniPlayer(playingTrack);
  const openYouTube = () => {
    const q = encodeURIComponent(`${playingTrack.title} ${playingTrack.artist} official music video`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
  };

  if (!playingTrack) {
    return (
      <>
        {miniPlayer && <MiniVideoPlayer track={miniPlayer} onClose={() => setMiniPlayer(null)} />}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/5"
          style={{ background: 'rgba(10,12,20,0.85)', backdropFilter: 'blur(24px)' }}>
          <div className="flex items-center justify-center gap-3 px-6 py-4 text-sm text-slate-500">
            <Music2 className="w-4 h-4 opacity-40" />
            Pick a track from Discover to start listening.
          </div>
        </div>
      </>
    );
  }

  const safeDuration = duration > 0 ? duration : (playingTrack.duration || 1);
  const pct = Math.min(100, (progress / safeDuration) * 100);

  return (
    <>
      {miniPlayer && (
        <MiniVideoPlayer
          track={miniPlayer}
          onClose={() => setMiniPlayer(null)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/5"
        style={{ background: 'rgba(10,12,20,0.92)', backdropFilter: 'blur(24px)' }}>

        {error && (
          <div className="px-6 py-1.5 text-xs text-amber-300 bg-amber-500/10 border-b border-amber-500/20 text-center">{error}</div>
        )}

        {/* Progress bar */}
        <div
          className="h-1 cursor-pointer relative group"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * safeDuration);
          }}
        >
          <div className="h-full transition-all duration-100"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none"
            style={{ left: `calc(${pct}% - 6px)` }} />
        </div>

        <div className="grid grid-cols-3 items-center px-6 py-3 gap-4">

          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {playingTrack.artwork ? (
                <img src={playingTrack.artwork} alt=""
                  className="w-12 h-12 rounded-xl object-cover shadow-lg"
                  style={{ boxShadow: isPlaying ? '0 0 16px rgba(245,158,11,0.4)' : undefined }} />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-slate-500" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate leading-tight">{playingTrack.title}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">{playingTrack.artist}</div>
              {/* Engine badge */}
              <div className="flex items-center gap-1.5 mt-1">
                {engine === 'youtube' && !playingTrack.isGenerative && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-500/15 border border-red-500/25 text-red-400">
                    <Youtube className="w-2.5 h-2.5" /> Full song
                  </span>
                )}
                {engine === 'generative' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/15 border border-purple-500/25 text-purple-400">
                    <Radio className="w-2.5 h-2.5" /> Generative
                  </span>
                )}
              </div>
              {/* YouTube action buttons */}
              {!playingTrack.isGenerative && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={openMiniPlayer}
                    title="Play video in mini player"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                  >
                    <Tv2 className="w-2.5 h-2.5" /> Play Video
                  </button>
                  <button
                    onClick={openYouTube}
                    title="Open on YouTube"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> YouTube
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transport */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button onClick={prev} className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5 active:scale-95">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={toggle}
                disabled={loading}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
              >
                {loading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : isPlaying
                    ? <Pause className="w-5 h-5 text-white" />
                    : <Play className="w-5 h-5 text-white ml-0.5" />
                }
              </button>
              <button onClick={next} className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5 active:scale-95">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 tabular-nums">
              <span>{formatTime(progress)}</span>
              <VisualizerWaveform />
              <span>{formatTime(safeDuration)}</span>
            </div>
          </div>

          {/* Volume + YouTube buttons right side (desktop) */}
          <div className="flex items-center justify-end gap-2">
            {!playingTrack.isGenerative && (
              <>
                <button
                  onClick={openMiniPlayer}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-transparent transition-all"
                >
                  <Tv2 className="w-3.5 h-3.5" /> Play Video
                </button>
                <button
                  onClick={openYouTube}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                >
                  <Youtube className="w-3.5 h-3.5" /> YouTube
                </button>
              </>
            )}
            <button onClick={() => setMuted(!muted)} className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="relative w-24 hidden sm:block">
              <input type="range" min={0} max={1} step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                className="w-full volume-slider"
                style={{ '--pct': `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}