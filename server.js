'use strict';

const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory write lock to serialize writes to posts.json
let writeQueue = Promise.resolve();
function withWriteLock(task) {
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

async function readPosts() {
  try {
    const buf = await fsp.readFile(POSTS_FILE);
    const data = JSON.parse(buf.toString('utf-8'));
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('Erro ao ler posts:', err);
    return [];
  }
}

async function writePosts(posts) {
  const tmp = POSTS_FILE + '.tmp';
  const json = JSON.stringify(posts, null, 2);
  await fsp.writeFile(tmp, json, 'utf-8');
  await fsp.rename(tmp, POSTS_FILE);
}

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(PUBLIC_DIR, {
  maxAge: '1h',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// API routes
app.get('/api/posts', async (req, res) => {
  const posts = await readPosts();
  // Return latest first, limited
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
  const ordered = posts.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  res.json(ordered);
});

app.post('/api/posts', async (req, res) => {
  let { text } = req.body || {};
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
  }
  // Normalize newlines and trim
  text = text.replace(/\r\n?/g, '\n').trim();

  const MIN_LEN = 3;
  const MAX_LEN = 1000;
  if (text.length < MIN_LEN) {
    return res.status(400).json({ error: `Seu relato é muito curto (mínimo ${MIN_LEN} caracteres).` });
  }
  if (text.length > MAX_LEN) {
    return res.status(400).json({ error: `Seu relato é muito longo (máximo ${MAX_LEN} caracteres).` });
  }

  const newPost = {
    id: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) ,
    text, // raw text; escaping is handled on render
    createdAt: Date.now()
  };

  try {
    await withWriteLock(async () => {
      const posts = await readPosts();
      posts.push(newPost);
      await writePosts(posts);
    });
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Erro ao salvar post:', err);
    res.status(500).json({ error: 'Não foi possível salvar seu relato agora.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Bonfire ouvindo em http://localhost:${PORT}`);
});
