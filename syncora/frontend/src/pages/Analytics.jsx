import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../utils/api';
import { BarChart, RingChart } from '../components/CustomCharts';
import { MOOD_THEMES } from '../utils/moods';
import { BarChart3, TrendingUp, Clock, Zap, Calendar, Music2 } from 'lucide-react';
import { useMood } from '../contexts/MoodContext';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-display font-bold">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function MoodHeatmap({ logs }) {
  const weeks = 8;
  const days  = 7;
  const now   = Date.now();
  const cells = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] || 0) + 1;
    });
    const result = [];
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < days; d++) {
        const date = new Date(now - (w * 7 + d) * 86400000);
        const key  = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        result.push({ date, count: map[key] || 0, key });
      }
    }
    return result;
  }, [logs, now]);

  const max = Math.max(...cells.map(c => c.count), 1);
  const dayLabels = ['S','M','T','W','T','F','S'];

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {dayLabels.map((l, i) => (
          <div key={i} className="w-5 h-5 text-[9px] text-slate-600 flex items-center justify-center">{l}</div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1" style={{ width: `${weeks * 24}px` }}>
        {cells.map((c, i) => {
          const intensity = c.count / max;
          return (
            <div key={i} title={`${c.date.toDateString()}: ${c.count} sessions`}
              className="w-5 h-5 rounded-sm transition-all cursor-default"
              style={{ background: c.count === 0 ? 'rgba(255,255,255,0.05)' : `rgba(245,158,11,${0.15 + intensity * 0.85})` }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
        <span>Less</span>
        {[0.1,0.3,0.5,0.7,0.9].map(v => (
          <div key={v} className="w-4 h-4 rounded-sm" style={{ background:`rgba(245,158,11,${v})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function MoodTimeline({ logs }) {
  const recent = logs.slice(-20).reverse();
  if (!recent.length) return <div className="text-sm text-slate-500 py-4">No data yet. Start logging your mood!</div>;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {recent.map((l, i) => {
        const mTheme = MOOD_THEMES[l.mood] || MOOD_THEMES['Calm'];
        return (
          <div key={l._id || i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/3 transition-colors">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: mTheme.hex }} />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-300">{l.mood}</span>
              {l.trackName && <span className="text-xs text-slate-600 ml-2 truncate">· {l.trackName}</span>}
            </div>
            <div className="text-[10px] text-slate-600 shrink-0">
              {new Date(l.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [logs, setLogs] = useState([]);
  const { theme } = useMood();

  useEffect(() => { api.listMoods().then(setLogs).catch(() => {}); }, []);

  const { data, totalSessions, streak, topMood, avgPerDay } = useMemo(() => {
    const counts = {};
    logs.forEach(l => { counts[l.mood] = (counts[l.mood] || 0) + 1; });
    const data = Object.keys(MOOD_THEMES).map(m => ({ label: m, value: counts[m] || 0, color: MOOD_THEMES[m].hex }));
    const topMood = data.reduce((a, b) => b.value > a.value ? b : a, data[0]);
    const streak = logs.length ? Math.min(7, Math.ceil(logs.length / 3)) : 0;
    const days = logs.length ? Math.max(1, Math.ceil((Date.now() - new Date(logs[logs.length-1]?.createdAt)) / 86400000)) : 1;
    return { data, totalSessions: logs.length, streak, topMood, avgPerDay: (logs.length / days).toFixed(1) };
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-amber-400" /> Analytics
        </h1>
        <div className="text-xs text-slate-500">{totalSessions} total sessions logged</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap}       label="Total sessions"  value={totalSessions}             color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Day streak"      value={`${streak}d`}              color="#ec4899" />
        <StatCard icon={Music2}    label="Top mood"         value={topMood?.label || '—'}     color={topMood?.color || '#10b981'} />
        <StatCard icon={Clock}     label="Avg / day"        value={avgPerDay}                 color="#8b5cf6" sub="sessions per day" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Sessions</div>
          <RingChart value={totalSessions} max={Math.max(20, totalSessions)} label="sessions" color="#f59e0b" />
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Streak</div>
          <RingChart value={streak} max={7} label="day streak" color="#ec4899" />
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Moods used</div>
          <RingChart value={data.filter(d => d.value > 0).length} max={6} label="moods used" color="#10b981" />
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" /> Mood distribution
        </h3>
        <BarChart data={data} />
      </div>

      {/* Heatmap + recent timeline side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" /> Activity heatmap
          </h3>
          <MoodHeatmap logs={logs} />
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Recent moods
          </h3>
          <MoodTimeline logs={logs} />
        </div>
      </div>
    </div>
  );
}
