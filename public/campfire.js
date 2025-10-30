(function(){
  const canvas = document.getElementById('campfire-canvas');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Simple particle system for flames
  const particles = [];
  const maxParticles = 400;
  const baseX = () => W * 0.5 + (Math.random() - 0.5) * 60; // width of fire base
  const baseY = () => H - 90;

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function spawn() {
    const count = 6; // particles per frame
    for (let i = 0; i < count; i++) {
      if (particles.length >= maxParticles) break;
      const size = rand(8, 26);
      particles.push({
        x: baseX(),
        y: baseY(),
        vx: rand(-0.4, 0.4),
        vy: rand(-1.6, -0.6),
        life: 0,
        maxLife: rand(1.2, 2.6),
        size,
        hue: rand(20, 45) // orange to yellow
      });
    }
  }

  function drawBackground(){
    // Night gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0f14');
    g.addColorStop(1, '#120d0a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Ground glow near fire base
    const r = ctx.createRadialGradient(W*0.5, H-80, 10, W*0.5, H-80, 240);
    r.addColorStop(0, 'rgba(255, 120, 40, 0.25)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, W, H);

    // Simple logs
    ctx.save();
    ctx.translate(W*0.5, H-70);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#5a3a26';
    roundRect(ctx, -140, -14, 220, 28, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(W*0.5, H-70);
    ctx.rotate(0.12);
    ctx.fillStyle = '#6a442c';
    roundRect(ctx, -120, -14, 220, 28, 14);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, Math.abs(w/2), Math.abs(h/2));
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
    ctx.fill();
  }

  function update(dt){
    // Spawn particles proportional to dt
    const spawns = Math.min(12, Math.floor(dt * 10));
    for (let i = 0; i < spawns; i++) spawn();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
      // Simple physics
      p.x += p.vx * (1 + p.life * 0.4);
      p.y += p.vy * (1 + p.life * 0.2);
      // Rise and spread
      p.vy -= 0.005;
      p.vx += (Math.random() - 0.5) * 0.02;
    }
  }

  function draw(){
    drawBackground();

    // Draw flame particles with additive blending
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const t = p.life / p.maxLife; // 0..1
      const alpha = (1 - t) * 0.9;
      const size = p.size * (1 - t * 0.8);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      const hue = p.hue;
      grad.addColorStop(0, `hsla(${hue}, 100%, 60%, ${alpha})`);
      grad.addColorStop(0.4, `hsla(${hue-10}, 100%, 50%, ${alpha*0.8})`);
      grad.addColorStop(1, `hsla(${hue-20}, 100%, 40%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Occasional sparks
    ctx.fillStyle = 'rgba(255, 200, 120, 0.8)';
    for (let i = 0; i < 12; i++) {
      const x = W*0.5 + (Math.random()-0.5) * 160;
      const y = H - 100 - Math.random() * 40;
      ctx.fillRect(x, y, 1, 2);
    }
  }

  let last = performance.now();
  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
