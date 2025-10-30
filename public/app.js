(function(){
  const postsEl = document.getElementById('posts');
  const form = document.getElementById('post-form');
  const textEl = document.getElementById('post-text');
  const messageEl = document.getElementById('form-message');

  const audio = document.getElementById('bg-audio');
  const audioToggle = document.getElementById('audio-toggle');
  const audioVolume = document.getElementById('audio-volume');

  // Audio controls
  let audioReady = false;
  audio.addEventListener('error', () => {
    audioToggle.disabled = true;
    audioToggle.textContent = 'Som indisponível';
  });
  audioVolume.addEventListener('input', () => {
    audio.volume = parseFloat(audioVolume.value);
  });
  audio.volume = parseFloat(audioVolume.value);

  function toggleAudio() {
    if (!audioReady) {
      // Try to load and play upon first interaction
      audio.load();
      audioReady = true;
    }
    if (audio.paused) {
      audio.play().then(() => {
        audioToggle.textContent = 'Pausar ambiente';
      }).catch(() => {
        audioToggle.textContent = 'Tocar ambiente';
      });
    } else {
      audio.pause();
      audioToggle.textContent = 'Tocar ambiente';
    }
  }
  audioToggle.addEventListener('click', toggleAudio);

  // Fetch helpers
  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error((await res.json()).error || 'Erro');
    return res.json();
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    } catch {
      return '';
    }
  }

  function renderPosts(items) {
    if (!Array.isArray(items)) return;
    postsEl.innerHTML = '';
    for (const p of items) {
      const li = document.createElement('li');
      li.className = 'post';
      const time = document.createElement('div');
      time.className = 'post-time';
      time.textContent = formatTime(p.createdAt);
      const content = document.createElement('div');
      content.className = 'post-text';
      // Preserve newlines
      content.innerHTML = escapeHTML(p.text).replace(/\n/g, '<br>');
      li.appendChild(time);
      li.appendChild(content);
      postsEl.appendChild(li);
    }
  }

  async function loadPosts() {
    try {
      const items = await fetchJSON('/api/posts?limit=100');
      renderPosts(items);
    } catch (e) {
      // silently ignore
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textEl.value.trim();
    if (!text) return;
    messageEl.textContent = 'Enviando...';
    try {
      await fetchJSON('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      textEl.value = '';
      messageEl.textContent = 'Relato enviado. Obrigado por compartilhar.';
      loadPosts();
    } catch (e) {
      messageEl.textContent = e.message || 'Não foi possível enviar seu relato.';
    }
  });

  // Initial load and auto-refresh
  loadPosts();
  setInterval(loadPosts, 15000);
})();
