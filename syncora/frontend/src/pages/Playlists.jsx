import React, { useEffect, useState } from 'react';
import { Music, Plus, Trash2, Play, ChevronDown, ChevronUp, ListMusic } from 'lucide-react';
import { api } from '../utils/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useMood } from '../contexts/MoodContext';
import { useUI } from '../contexts/UIContext';
import { formatTime } from '../utils/moods';

function PlaylistCard({ pl, onDelete, onPlay }) {
  const [expanded, setExpanded] = useState(false);
  const { MOOD_THEMES } = useMood();
  const mTheme = MOOD_THEMES[pl.mood] || MOOD_THEMES['Calm'];

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
      {/* Header bar with mood color */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${mTheme.hex}, #ec4899)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${mTheme.hex}20` }}>
              <ListMusic className="w-4.5 h-4.5" style={{ color: mTheme.hex }} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{pl.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white mr-1.5" style={{ background: mTheme.hex }}>{pl.mood}</span>
                {pl.tracks?.length || 0} tracks
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => onPlay(pl)} disabled={!pl.tracks?.length}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all hover:scale-105">
              <Play className="w-4 h-4" />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => onDelete(pl._id || pl.id)} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Track list */}
        {expanded && (
          <div className="mt-3 border-t border-white/5 pt-3 space-y-1">
            {(!pl.tracks || pl.tracks.length === 0) && (
              <div className="text-xs text-slate-500 py-2">No tracks yet.</div>
            )}
            {(pl.tracks || []).map((t, i) => (
              <div key={t.id || i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
                <span className="text-[10px] text-slate-600 w-4 text-right shrink-0">{i+1}</span>
                {t.artwork && (
                  <img src={t.artwork} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{t.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{t.artist}</div>
                </div>
                <div className="text-[10px] text-slate-600 shrink-0">{formatTime(t.duration)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Preview thumbnails (collapsed) */}
        {!expanded && pl.tracks?.length > 0 && (
          <div className="flex -space-x-2 mt-2">
            {(pl.tracks || []).slice(0, 5).map((t, i) => (
              t.artwork ? (
                <img key={i} src={t.artwork} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-black/50" />
              ) : (
                <div key={i} className="w-7 h-7 rounded-full bg-white/10 border-2 border-black/50 flex items-center justify-center">
                  <Music className="w-3 h-3 text-slate-500" />
                </div>
              )
            ))}
            {pl.tracks.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-black/50 flex items-center justify-center text-[9px] text-slate-400">
                +{pl.tracks.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Playlists() {
  const [lists, setLists]   = useState([]);
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const { playingTrack, playTrack, setQueue } = usePlayer();
  const { currentMood, MOOD_THEMES } = useMood();
  const { notify } = useUI();

  const load = () => api.listPlaylists().then(setLists).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const p = await api.createPlaylist({ name, mood: currentMood, tracks: playingTrack ? [playingTrack] : [] });
      setLists([p, ...lists]);
      setName('');
      notify(`✨ Playlist "${name}" created`);
    } catch {}
    setLoading(false);
  };

  const remove = async (id) => {
    await api.deletePlaylist(id).catch(() => {});
    setLists(lists.filter(l => (l._id || l.id) !== id));
    notify('Playlist deleted');
  };

  const playAll = (pl) => {
    if (pl.tracks?.length) {
      setQueue(pl.tracks);
      playTrack(pl.tracks[0]);
      notify(`▶ Playing "${pl.name}"`);
    }
  };

  const totalTracks = lists.reduce((s, l) => s + (l.tracks?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold flex items-center gap-3">
          <Music className="w-7 h-7 text-amber-400" /> Playlists
        </h1>
        <div className="text-xs text-slate-500">{lists.length} playlists · {totalTracks} tracks</div>
      </div>

      {/* Create bar */}
      <div className="glass rounded-2xl p-4 border border-white/5">
        <div className="text-xs text-slate-500 mb-3">
          {playingTrack
            ? <>Current track <span className="text-amber-400">{playingTrack.title}</span> will be added</>
            : 'Create a new playlist'}
        </div>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="Playlist name…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 outline-none text-sm focus:border-white/15 transition-colors" />
          <button onClick={create} disabled={!name.trim() || loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#f59e0b,#ec4899)', color:'#fff' }}>
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <div>No playlists yet.</div>
          <div className="text-sm mt-1">Create one above to get started.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(pl => (
            <PlaylistCard key={pl._id || pl.id} pl={pl} onDelete={remove} onPlay={playAll} />
          ))}
        </div>
      )}
    </div>
  );
}
