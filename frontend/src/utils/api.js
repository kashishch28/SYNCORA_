const BASE = '/api';

function authHeaders() {
  const t = localStorage.getItem('syncora_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  searchMusic: (q) => request(`/music/search?q=${encodeURIComponent(q)}`),
  searchSuggestions: (q) => request(`/music/suggestions?q=${encodeURIComponent(q)}`),
  getYouTubeId: (title, artist) => request(`/music/youtube?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`),
  listMoods: () => request('/moods'),
  logMood: (body) => request('/moods', { method: 'POST', body: JSON.stringify(body) }),
  listNotes: () => request('/notes'),
  createNote: (body) => request('/notes', { method: 'POST', body: JSON.stringify(body) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
  listPlaylists: () => request('/playlists'),
  createPlaylist: (body) => request('/playlists', { method: 'POST', body: JSON.stringify(body) }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
  getYouTubeId: (title, artist) => request(`/music/youtube?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`),
};
