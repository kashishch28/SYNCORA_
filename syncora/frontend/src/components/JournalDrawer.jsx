import React, { useState, useEffect } from 'react';
import { X, Plus, Lock, Trash2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../contexts/MoodContext';
import { api } from '../utils/api';
import { localCrypto } from '../utils/crypto';

export default function JournalDrawer() {
  const { journalOpen, setJournalOpen, notify } = useUI();
  const { isAuthed } = useAuth();
  const { currentMood } = useMood();
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState({});

  useEffect(() => {
    if (!journalOpen || !isAuthed) return;
    api.listNotes().then(setEntries).catch(() => {});
  }, [journalOpen, isAuthed]);

  const save = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!password.trim()) { notify('Set a password to encrypt'); return; }
    const encrypted = localCrypto.encrypt(content, password);
    const n = await api.createNote({ title, mood: currentMood, encryptedContent: encrypted, isEncrypted: true, tags: [] });
    setEntries([n, ...entries]);
    setTitle(''); setContent('');
    notify('Note saved');
  };

  const remove = async (id) => {
    await api.deleteNote(id);
    setEntries(entries.filter(e => (e._id || e.id) !== id));
  };

  const tryReveal = (e) => {
    const id = e._id || e.id;
    const plain = localCrypto.decrypt(e.encryptedContent, password);
    setReveal({ ...reveal, [id]: plain || '(wrong password)' });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[420px] max-w-full glass border-l border-white/5 z-40 transform transition-transform ${journalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="font-display font-semibold text-lg">Encrypted Journal</h3>
        <button onClick={() => setJournalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-5 space-y-3 border-b border-white/5">
        <input type="password" placeholder="Encryption password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 outline-none text-sm" />
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 outline-none text-sm" />
        <textarea placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)}
          rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 outline-none text-sm resize-none" />
        <button onClick={save} className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Save encrypted entry
        </button>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {entries.length === 0 && <div className="text-sm text-slate-500">No entries yet.</div>}
        {entries.map(e => {
          const id = e._id || e.id;
          return (
            <div key={id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{e.title}</div>
                <button onClick={() => remove(id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleString()} · {e.mood}</div>
              {reveal[id] ? (
                <div className="text-sm text-slate-300 whitespace-pre-wrap">{reveal[id]}</div>
              ) : (
                <button onClick={() => tryReveal(e)} className="text-xs text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Decrypt
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
