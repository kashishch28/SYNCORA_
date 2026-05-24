export const MOOD_THEMES = {
  Happy: {
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    accent: 'text-amber-400', bgAccent: 'bg-amber-500', border: 'border-amber-500/30',
    hex: '#f59e0b',
    tagline: 'Vibrant, uplifting frequencies to match your radiance.',
    defaultSearch: 'happy pop summer hits', tempo: 95,
  },
  Energetic: {
    gradient: 'from-rose-600/20 via-orange-500/10 to-transparent',
    accent: 'text-rose-400', bgAccent: 'bg-rose-500', border: 'border-rose-500/30',
    hex: '#f43f5e',
    tagline: 'High-octane pulsing basslines and driving sequences.',
    defaultSearch: 'workout edm electronic', tempo: 110,
  },
  Focused: {
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accent: 'text-emerald-400', bgAccent: 'bg-emerald-500', border: 'border-emerald-500/30',
    hex: '#10b981',
    tagline: 'Deep concentration loops and steady rhythms.',
    defaultSearch: 'lofi focus study beats', tempo: 75,
  },
  Calm: {
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
    accent: 'text-sky-400', bgAccent: 'bg-sky-500', border: 'border-sky-500/30',
    hex: '#0ea5e9',
    tagline: 'Serene acoustic washes and warm soundscapes.',
    defaultSearch: 'ambient meditation relaxation', tempo: 60,
  },
  Sad: {
    gradient: 'from-blue-600/20 via-slate-700/10 to-transparent',
    accent: 'text-blue-400', bgAccent: 'bg-blue-600', border: 'border-blue-500/30',
    hex: '#3b82f6',
    tagline: 'Melancholic harmonies to keep you centered.',
    defaultSearch: 'melancholy piano slow indie', tempo: 65,
  },
  Melancholic: {
    gradient: 'from-purple-600/20 via-pink-700/10 to-transparent',
    accent: 'text-purple-400', bgAccent: 'bg-purple-600', border: 'border-purple-500/30',
    hex: '#a855f7',
    tagline: 'Dreamy shoegaze and nostalgic trip-hop tones.',
    defaultSearch: 'dream pop shoegaze nostalgia', tempo: 70,
  },
};

export const formatTime = (s) => {
  if (isNaN(s) || s == null) return '0:00';
  const m = Math.floor(s / 60), x = Math.floor(s % 60);
  return `${m}:${x < 10 ? '0' : ''}${x}`;
};

export const getSeed = (str) => {
  if (!str) return 42;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
};
