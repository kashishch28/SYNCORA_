const router = require('express').Router();
const auth = require('../middleware/auth');
const { isMongo, fileStore } = require('../config/db');
const Playlist = require('../models/Playlist');

router.get('/', auth, async (req, res, next) => {
  try {
    if (isMongo()) return res.json(await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 }));
    res.json(fileStore.read('playlists').filter(p => p.userId === req.user.id));
  } catch (e) { next(e); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const payload = { ...req.body, userId: req.user.id, createdAt: new Date().toISOString() };
    if (isMongo()) return res.json(await Playlist.create(payload));
    const all = fileStore.read('playlists');
    const p = { id: 'p_' + Date.now(), ...payload };
    all.push(p); fileStore.write('playlists', all);
    res.json(p);
  } catch (e) { next(e); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    if (isMongo()) {
      const p = await Playlist.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
      return res.json(p);
    }
    const all = fileStore.read('playlists');
    const idx = all.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    all[idx] = { ...all[idx], ...req.body };
    fileStore.write('playlists', all);
    res.json(all[idx]);
  } catch (e) { next(e); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (isMongo()) {
      await Playlist.deleteOne({ _id: req.params.id, userId: req.user.id });
      return res.json({ ok: true });
    }
    fileStore.write('playlists', fileStore.read('playlists').filter(p => !(p.id === req.params.id && p.userId === req.user.id)));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
