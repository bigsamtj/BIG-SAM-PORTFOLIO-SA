/* ==========================================================================
   SAMUEL ADEYINKA — PORTFOLIO HERO
   Vanilla JS: custom cursor, scramble/decode text, 3D dot-matrix globe
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CUSTOM CURSOR
   -------------------------------------------------------------------------- */
(function customCursor(){
  const cursor = document.getElementById('cursor');
  let mx = -100, my = -100;      // real mouse position
  let cx = -100, cy = -100;      // rendered (lagged) position
  const EASE = 0.18;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  window.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));

  // hover state on every interactive element
  const interactive = document.querySelectorAll('a, button, .globe-wrap, [data-cursor-active]');
  interactive.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });

  function loop(){
    cx += (mx - cx) * EASE;
    cy += (my - cy) * EASE;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* --------------------------------------------------------------------------
   2. SCRAMBLE / DECODE TEXT EFFECT
   Hovering scrambles the text into random glyphs, then resolves it back
   to the original label, left to right.
   -------------------------------------------------------------------------- */
(function scrambleText(){
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#$%01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const timers = new WeakMap();

  function run(el){
    const original = el.dataset.text || el.textContent;
    if (timers.has(el)) clearInterval(timers.get(el));

    let iteration = 0;
    const speed = 3; // higher = faster resolve

    const id = setInterval(() => {
      el.textContent = original
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iteration) return original[i];
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');

      if (iteration >= original.length){
        clearInterval(id);
        el.textContent = original;
      }
      iteration += speed / 10 * 3;
    }, 30);

    timers.set(el, id);
  }

  document.querySelectorAll('[data-scramble]').forEach(el => {
    el.addEventListener('mouseenter', () => run(el));
  });
})();

/* --------------------------------------------------------------------------
   3. STARFIELD (ambient, drawn once)
   -------------------------------------------------------------------------- */
(function starfield(){
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function size(){
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    draw();
  }

  function draw(){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    const count = Math.floor((window.innerWidth * window.innerHeight) / 3800);
    for (let i=0; i<count; i++){
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 1.1 + .2;
      const a = Math.random() * .6 + .15;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }
  }

  window.addEventListener('resize', size);
  size();
})();

/* --------------------------------------------------------------------------
   4. 3D DOT-MATRIX GLOBE
   Custom minimal 3D engine: lat/lon -> unit sphere -> rotate -> project.
   No external libraries — everything below is written from scratch.
   -------------------------------------------------------------------------- */
(function globe(){
  const canvas   = document.getElementById('globe');
  const wrap     = document.getElementById('globeWrap');
  const markersEl= document.getElementById('markers');
  const ctx      = canvas.getContext('2d');

  /* ---- geometry helpers ------------------------------------------------ */
  const DEG = Math.PI / 180;

  function latLonToXYZ(latDeg, lonDeg){
    const lat = latDeg * DEG;
    const lon = lonDeg * DEG;
    return {
      x: Math.cos(lat) * Math.sin(lon),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon)
    };
  }

  // rotate around Y (yaw) then X (pitch)
  function rotate(p, rotY, rotX){
    let x = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
    let z = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y;

    let y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);

    return { x, y: y2, z: z2 };
  }

  /* ---- simplified landmass mask (union of lat/lon ellipses) ------------
     Not survey-accurate — a stylised approximation, tuned to read as
     recognisable continents at dot-matrix resolution.                    */
  const LANDMASSES = [
    // North America
    { lat:48, lon:-102, rlat:20, rlon:26 },
    { lat:64, lon:-155, rlat:9,  rlon:11 },
    { lat:20, lon:-102, rlat:9,  rlon:8  },
    { lat:60, lon:-85,  rlat:13, rlon:16 },
    // South America
    { lat:-6,  lon:-58, rlat:19, rlon:11 },
    { lat:-30, lon:-64, rlat:12, rlon:9  },
    // Europe
    { lat:50, lon:15, rlat:11, rlon:17 },
    { lat:61, lon:19, rlat:8,  rlon:11 },
    // Africa
    { lat:16,  lon:20, rlat:16, rlon:16 },
    { lat:-10, lon:22, rlat:16, rlon:14 },
    { lat:-29, lon:24, rlat:8,  rlon:10 },
    { lat:9,   lon:46, rlat:6,  rlon:6  },
    // Middle East
    { lat:27, lon:44, rlat:9, rlon:11 },
    // Asia
    { lat:56, lon:88,  rlat:19, rlon:42 },
    { lat:34, lon:104, rlat:14, rlon:18 },
    { lat:22, lon:80,  rlat:12, rlon:12 },
    { lat:9,  lon:104, rlat:9,  rlon:11 },
    { lat:60, lon:132, rlat:11, rlon:26 },
    { lat:36, lon:138, rlat:5,  rlon:4  },
    // Australia
    { lat:-25, lon:134, rlat:11, rlon:15 },
  ];

  function isLand(lat, lon){
    for (const m of LANDMASSES){
      let dLon = lon - m.lon;
      if (dLon > 180) dLon -= 360;
      if (dLon < -180) dLon += 360;
      const dLat = lat - m.lat;
      const v = (dLon*dLon)/(m.rlon*m.rlon) + (dLat*dLat)/(m.rlat*m.rlat);
      if (v <= 1) return true;
    }
    return false;
  }

  const landPoints = [];
  for (let lat=-80; lat<=82; lat+=2.4){
    for (let lon=-180; lon<180; lon+=2.4){
      if (isLand(lat, lon)) landPoints.push(latLonToXYZ(lat, lon));
    }
  }

  /* ---- featured countries ---------------------------------------------- */
  const COUNTRIES = [
    { name:'TURKEY',        lat:39,  lon:35  },
    { name:'ISRAEL',        lat:31,  lon:35  },
    { name:'EGYPT',         lat:27,  lon:30  },
    { name:'QATAR',         lat:25,  lon:51  },
    { name:'SAUDI ARABIA',  lat:24,  lon:45  },
    { name:'KENYA',         lat:-1,  lon:38  },
    { name:'UNITED STATES', lat:39,  lon:-98 },
    { name:'UNITED KINGDOM',lat:54,  lon:-2  },
    { name:'GERMANY',       lat:51,  lon:10  },
    { name:'FRANCE',        lat:47,  lon:2   },
    { name:'SPAIN',         lat:40,  lon:-4  },
    { name:'ITALY',         lat:43,  lon:12  },
    { name:'JAPAN',         lat:36,  lon:138 },
    { name:'CHINA',         lat:35,  lon:105 },
    { name:'SOUTH KOREA',   lat:36,  lon:128 },
    { name:'CANADA',        lat:56,  lon:-106},
    { name:'SINGAPORE',     lat:1,   lon:104 },
    { name:'AUSTRALIA',     lat:-25, lon:135 },
  ];

  const markerNodes = COUNTRIES.map(c => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = `
      <div class="marker-line"></div>
      <div class="marker-dot"></div>
      <div class="marker-label">${c.name}</div>
    `;
    markersEl.appendChild(el);
    return { data: c, el, base: latLonToXYZ(c.lat, c.lon) };
  });

  /* ---- canvas sizing ----------------------------------------------------*/
  let W = 0, H = 0, R = 0, CX = 0, CY = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    R  = Math.min(W, H) * 0.42;
    CX = W * 0.5;
    CY = H * 0.5;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---- rotation state ---------------------------------------------------
     Two layers combine:
       - autoRotY: slow perpetual spin
       - followX/followY: gentle parallax that tracks the mouse anywhere
         on the page
       - dragOffset: direct manual control when the user click-drags
         on the globe itself
  ------------------------------------------------------------------------*/
  let autoRotY = 0;
  let followTX = 0, followTY = 0;   // target
  let followX  = 0, followY  = 0;   // eased

  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragOffsetX = 0, dragOffsetY = 0;   // accumulated manual offsets
  let dragStartOffsetX = 0, dragStartOffsetY = 0;
  let lastInteraction = Date.now();

  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth)  * 2 - 1; // -1..1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    followTX = nx * 0.5;              // yaw influence
    followTY = clamp(ny * 0.28, -0.4, 0.4); // pitch influence

    if (dragging){
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragOffsetX = dragStartOffsetX + dx * 0.008;
      dragOffsetY = clamp(dragStartOffsetY + dy * 0.008, -1.2, 1.2);
      lastInteraction = Date.now();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffsetX = dragOffsetX;
    dragStartOffsetY = dragOffsetY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  /* ---- orbiting comet streaks --------------------------------------------
     Thin trailing arcs that sweep around the globe's rim, like the
     satellite/shooting-star trails in the reference art. Each comet
     travels a tilted ellipse just outside the sphere radius; a short
     fading trail is kept and redrawn every frame.
  ------------------------------------------------------------------------*/
  const comets = [
    { rxF:1.24, ryF:0.40, tilt:-0.32, speed: 0.010, angle: 0.6,  color:'255,158,80',  trail:[] },
    { rxF:1.36, ryF:0.26, tilt: 0.18, speed:-0.007, angle: 3.4,  color:'255,255,255', trail:[] },
  ];
  const TRAIL_LEN = 22;

  function drawComets(){
    for (const c of comets){
      c.angle += c.speed;
      const ex = Math.cos(c.angle) * R * c.rxF;
      const ey = Math.sin(c.angle) * R * c.ryF;
      const rx = ex * Math.cos(c.tilt) - ey * Math.sin(c.tilt);
      const ry = ex * Math.sin(c.tilt) + ey * Math.cos(c.tilt);
      const px = CX + rx;
      const py = CY + ry;

      c.trail.push({ x:px, y:py });
      if (c.trail.length > TRAIL_LEN) c.trail.shift();

      for (let i=1; i<c.trail.length; i++){
        const t = i / c.trail.length;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${c.color}, ${t * 0.65})`;
        ctx.lineWidth = 0.6 + t * 1.6;
        ctx.moveTo(c.trail[i-1].x, c.trail[i-1].y);
        ctx.lineTo(c.trail[i].x, c.trail[i].y);
        ctx.stroke();
      }

      const head = c.trail[c.trail.length - 1];
      if (head){
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c.color},0.95)`;
        ctx.arc(head.x, head.y, 1.8, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  /* ---- draw loop ---------------------------------------------------------*/
  function draw(){
    const idle = Date.now() - lastInteraction > 400;
    autoRotY += idle ? 0.0016 : 0.0003;

    followX += (followTX - followX) * 0.045;
    followY += (followTY - followY) * 0.045;

    const rotY = autoRotY + followX + dragOffsetX;
    const rotX = followY + dragOffsetY;

    ctx.clearRect(0, 0, W, H);

    // --- sphere base fill (clipped circle) ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI*2);
    ctx.clip();

    const grad = ctx.createRadialGradient(
      CX - R*0.42, CY + R*0.5, R*0.05,
      CX, CY, R*1.35
    );
    grad.addColorStop(0,   '#3f8bff');
    grad.addColorStop(0.28,'#0e3f96');
    grad.addColorStop(0.55,'#071c47');
    grad.addColorStop(0.8, '#050912');
    grad.addColorStop(1,   '#020204');
    ctx.fillStyle = grad;
    ctx.fillRect(CX - R, CY - R, R*2, R*2);

    // subtle top-left orange atmosphere bleeding onto the sphere surface
    const rim = ctx.createRadialGradient(
      CX - R*0.55, CY - R*0.55, 0,
      CX - R*0.55, CY - R*0.55, R*1.15
    );
    rim.addColorStop(0, 'rgba(255,150,80,0.35)');
    rim.addColorStop(0.4, 'rgba(255,120,60,0.08)');
    rim.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = rim;
    ctx.fillRect(CX - R, CY - R, R*2, R*2);

    // --- dot-matrix landmasses ---
    for (let i=0; i<landPoints.length; i++){
      const p = rotate(landPoints[i], rotY, rotX);
      if (p.z <= 0.02) continue;
      const sx = CX + p.x * R;
      const sy = CY - p.y * R;
      const depth = p.z;              // 0..1
      const alpha = 0.18 + depth * 0.75;
      const size  = 0.85 + depth * 1.35;
      ctx.beginPath();
      ctx.fillStyle = `rgba(235,240,255,${alpha})`;
      ctx.arc(sx, sy, size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();

    // --- outer edge glow ring ---
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI*2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(90,150,255,0.25)';
    ctx.stroke();

    // --- orbiting comet streaks ---
    drawComets();

    // --- country markers (DOM overlay, positioned from the same math) ---
    for (const m of markerNodes){
      const p = rotate(m.base, rotY, rotX);
      const visible = p.z > 0.12;
      if (visible){
        const sx = CX + p.x * R;
        const sy = CY - p.y * R;
        m.el.style.transform = `translate(${sx}px, ${sy}px)`;
        m.el.classList.add('visible');

        // "hot" state when the real cursor is near this marker
        const dx = sx + wrap.getBoundingClientRect().left - lastMouse.x;
        const dy = sy + wrap.getBoundingClientRect().top  - lastMouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        m.el.classList.toggle('hot', dist < 46);
      } else {
        m.el.classList.remove('visible');
      }
    }

    requestAnimationFrame(draw);
  }

  const lastMouse = { x:-9999, y:-9999 };
  window.addEventListener('mousemove', (e) => {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  });

  draw();
})();

/* --------------------------------------------------------------------------
   5. PROFILE PHOTO — graceful fallback
   If the "SAM PUT THE ICON/PICTURE LINK HERE" placeholder src is still in
   place, the image will fail to load and the frame keeps its placeholder
   pattern. Swap the src in index.html and this fades the real photo in.
   -------------------------------------------------------------------------- */
(function profilePhoto(){
  const img = document.querySelector('.profile-photo');
  if (!img) return;
  img.addEventListener('load', () => {
    if (img.naturalWidth > 1) img.style.opacity = 1;
  });
})();

/* --------------------------------------------------------------------------
   6. DECORATIVE BACKGROUND CODE
   Purely ornamental faint hex/binary strings behind the photo frame.
   -------------------------------------------------------------------------- */
(function decorCode(){
  const el = document.getElementById('decorCode');
  if (!el) return;
  const chars = '01ABCDEF';
  const lines = [];
  for (let i=0; i<26; i++){
    let line = '';
    const len = 6 + Math.floor(Math.random()*10);
    for (let j=0; j<len; j++) line += chars[Math.floor(Math.random()*chars.length)];
    lines.push(line);
  }
  el.textContent = lines.join('\n');
})();

/* --------------------------------------------------------------------------
   7. PARTICLE MORPH NAME — "SAMUEL ADEYINKA"
   The name is rendered to an offscreen canvas, sampled into particles,
   then redrawn each frame. Particles at rest reform the crisp text;
   moving the mouse across it repels nearby particles, which spring back
   into place once the cursor moves away.
   -------------------------------------------------------------------------- */
(function particleName(){
  const canvas = document.getElementById('nameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  const LINES = ['SAMUEL', 'ADEYINKA'];
  let particles = [];
  let W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const mouse = { x:-9999, y:-9999, active:false };

  function buildParticles(){
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    // offscreen sampling canvas at device pixel resolution
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d');

    const fontSize = H * dpr * 0.40;
    octx.fillStyle = '#fff';
    octx.textBaseline = 'middle';
    octx.textAlign = 'left';
    octx.font = `900 ${fontSize}px 'Orbitron', sans-serif`;

    const lineHeight = (H * dpr) / LINES.length;
    LINES.forEach((line, i) => {
      octx.fillText(line, H * dpr * 0.02, lineHeight * (i + 0.62));
    });

    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(3, Math.floor(dpr * 3));
    const pts = [];
    for (let y=0; y<off.height; y+=step){
      for (let x=0; x<off.width; x+=step){
        const idx = (y * off.width + x) * 4 + 3; // alpha channel
        if (img[idx] > 120){
          pts.push({
            x: x + (Math.random()-0.5)*2,
            y: y + (Math.random()-0.5)*2,
            homeX: x, homeY: y,
            vx: 0, vy: 0,
            r: 0.9 + Math.random()*1.1,
            shade: Math.random()
          });
        }
      }
    }
    particles = pts;
  }

  function gradientFor(shade){
    // steel / brushed-chrome tone with a faint cyan energy tint on displaced particles
    const stops = ['#f4f6f8', '#c3c8cd', '#8b9096', '#dfe2e5', '#9aa0a6'];
    const i = Math.floor(shade * stops.length) % stops.length;
    return stops[i];
  }

  function frame(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    const mx = mouse.active ? mouse.x * dpr : -9999;
    const my = mouse.active ? mouse.y * dpr : -9999;
    const REPEL = 70 * dpr;

    for (let i=0; i<particles.length; i++){
      const p = particles[i];
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < REPEL){
        const force = (1 - dist / REPEL) * 3.4;
        const ang = Math.atan2(dy, dx);
        p.vx += Math.cos(ang) * force;
        p.vy += Math.sin(ang) * force;
      }

      // spring back home
      p.vx += (p.homeX - p.x) * 0.03;
      p.vy += (p.homeY - p.y) * 0.03;

      // friction
      p.vx *= 0.82;
      p.vy *= 0.82;

      p.x += p.vx;
      p.y += p.vy;

      const displaced = dist < REPEL;
      ctx.beginPath();
      ctx.fillStyle = displaced ? '#7fe3ff' : gradientFor(p.shade);
      ctx.arc(p.x/dpr, p.y/dpr, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  wrap.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  wrap.addEventListener('mouseleave', () => { mouse.active = false; });

  function init(){
    buildParticles();
  }

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(init);
  } else {
    init();
  }
  window.addEventListener('resize', () => { buildParticles(); });

  frame();
})();

/* --------------------------------------------------------------------------
   8. NUMBER SCRAMBLE / DECODE ON SCROLL
   Stat numbers cycle through random digits and resolve to their real
   value once the panel scrolls into view.
   -------------------------------------------------------------------------- */
(function numberDecode(){
  const nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;

  function decode(el){
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const digits = String(target).length;
    let frame = 0;
    const totalFrames = 26;

    const id = setInterval(() => {
      if (frame >= totalFrames){
        el.textContent = target + suffix;
        clearInterval(id);
        return;
      }
      if (frame > totalFrames - 8){
        // ease into the true value on the final frames
        const progress = (frame - (totalFrames - 8)) / 8;
        const val = Math.floor(target * progress);
        el.textContent = val + suffix;
      } else {
        let rnd = '';
        for (let i=0; i<digits; i++) rnd += Math.floor(Math.random()*10);
        el.textContent = rnd + suffix;
      }
      frame++;
    }, 45);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        decode(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold:.5 });

  nums.forEach(el => io.observe(el));
})();

/* --------------------------------------------------------------------------
   9. TOOLS MARQUEE
   Generated from data so the strip is easy to extend. Each icon looks for
   a real logo first (src holds a placeholder for Sam to swap in) and
   falls back to a styled monogram badge until one is provided.
   -------------------------------------------------------------------------- */
(function toolsMarquee(){
  const track = document.getElementById('toolsTrack');
  if (!track) return;

  const TOOLS = [
    { name:'Autopsy',      mono:'AU',  bg:'#ffffff', color:'#1c1c1c' },
    { name:'FTK Imager',   mono:'FTK', bg:'#ffffff', color:'#1957c2' },
    { name:'Magnet AXIOM', mono:'M',   bg:'#ffffff', color:'#1957c2' },
    { name:'Cellebrite',   mono:'CB',  bg:'#ffffff', color:'#1c1c1c' },
    { name:'Volatility',   mono:'V',   bg:'#ffffff', color:'#caa23d' },
    { name:'Kali Linux',   mono:'K',   bg:'#0a0a0a', color:'#ffffff' },
    { name:'Wireshark',    mono:'WS',  bg:'#ffffff', color:'#1957c2' },
    { name:'Nmap',         mono:'N',   bg:'#0a0a0a', color:'#3ad6ff' },
    { name:'Burp Suite',   mono:'BP',  bg:'#ffffff', color:'#ff6a1a' },
    { name:'Metasploit',   mono:'M',   bg:'#ffffff', color:'#1957c2' },
    { name:'Python',       mono:'Py',  bg:'linear-gradient(135deg,#356e9e,#ffd43b)', color:'#ffffff' },
    { name:'Git',          mono:'git', bg:'#f05133', color:'#ffffff' },
    { name:'GitHub',       mono:'GH',  bg:'#111111', color:'#ffffff' },
    { name:'HTML',         mono:'5',   bg:'#e34c26', color:'#ffffff' },
    { name:'CSS',          mono:'3',   bg:'#1572b6', color:'#ffffff' },
    { name:'JavaScript',   mono:'JS',  bg:'#f0db4f', color:'#1c1c1c' },
    { name:'APIs',         mono:'API', bg:'#2a2c30', color:'#ffffff' },
  ];

  function card(tool){
    const el = document.createElement('div');
    el.className = 'tool';
    el.innerHTML = `
      <div class="tool-icon" style="--tool-bg:${tool.bg}; --tool-color:${tool.color}">
        <img alt="${tool.name}" src="SAM PUT THE ICON/PICTURE LINK HERE (${tool.name} logo)" />
        <span class="tool-mono">${tool.mono}</span>
      </div>
      <p class="tool-name">${tool.name}</p>
    `;
    const img = el.querySelector('img');
    img.addEventListener('load', () => {
      if (img.naturalWidth > 1) img.style.opacity = 1;
    });
    return el;
  }

  // duplicate the list once so the marquee loop is seamless
  [...TOOLS, ...TOOLS].forEach(t => track.appendChild(card(t)));

  const arrow = document.getElementById('toolsArrow');
  if (arrow){
    arrow.addEventListener('click', () => {
      track.scrollBy ? null : null; // track uses CSS animation, arrow acts as a visual affordance
      track.style.animationPlayState =
        track.style.animationPlayState === 'paused' ? 'running' : 'paused';
    });
  }
})();

/* --------------------------------------------------------------------------
   10. EXTRACTION SEQUENCE — scroll-triggered crossfade
   The three reference renders are the actual visual (crossfaded via CSS
   keyframes in style.css); this just starts/restarts the timeline when
   the section scrolls into view so it replays each time.
   -------------------------------------------------------------------------- */
(function extractionSequence(){
  const stage = document.getElementById('labStage');
  if (!stage) return;

  function play(){
    stage.classList.remove('play');
    void stage.offsetWidth; // force reflow so the animation restarts cleanly
    stage.classList.add('play');
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        play();
      } else {
        stage.classList.remove('play');
      }
    });
  }, { threshold:.35 });

  io.observe(stage);
})();

/* --------------------------------------------------------------------------
   12. EXPERTISE SECTION — scroll trigger for the bug arrival + watermark
   -------------------------------------------------------------------------- */
(function expertiseTrigger(){
  const section = document.getElementById('expertise');
  if (!section) return;

  function play(){
    section.classList.remove('play');
    void section.offsetWidth;
    section.classList.add('play');
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        play();
      } else {
        section.classList.remove('play');
      }
    });
  }, { threshold:.3 });

  io.observe(section);
})();

/* --------------------------------------------------------------------------
   13. QUOTE PARTICLE MORPH — "SECURE TODAY. PROTECT TOMORROW.
   EMPOWER FOREVER. THAT'S MY EXPERTISE." Same particle-repel engine as
   the About name, tuned for four lines with the last line dimmer to
   match the reference art's fade.
   -------------------------------------------------------------------------- */
(function quoteParticles(){
  const canvas = document.getElementById('quoteCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  const LINES = ['SECURE TODAY.', 'PROTECT TOMORROW.', 'EMPOWER FOREVER.', "THAT'S MY EXPERTISE."];
  let particles = [];
  let W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x:-9999, y:-9999, active:false };

  function buildParticles(){
    W = wrap.clientWidth - 20;
    H = 250;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d');

    const fontSize = (H * dpr) / LINES.length * 0.62;
    octx.fillStyle = '#fff';
    octx.textBaseline = 'middle';
    octx.textAlign = 'left';
    octx.font = `800 ${fontSize}px 'Orbitron', sans-serif`;

    const lineHeight = (H * dpr) / LINES.length;
    LINES.forEach((line, i) => {
      octx.fillText(line, H * dpr * 0.015, lineHeight * (i + 0.58));
    });

    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(3, Math.floor(dpr * 2.6));
    const pts = [];
    for (let y=0; y<off.height; y+=step){
      const lineIdx = Math.min(LINES.length - 1, Math.floor(y / lineHeight));
      for (let x=0; x<off.width; x+=step){
        const idx = (y * off.width + x) * 4 + 3;
        if (img[idx] > 120){
          pts.push({
            x: x + (Math.random()-0.5)*2,
            y: y + (Math.random()-0.5)*2,
            homeX: x, homeY: y,
            vx: 0, vy: 0,
            r: 0.85 + Math.random()*1.05,
            shade: Math.random(),
            line: lineIdx
          });
        }
      }
    }
    particles = pts;
  }

  function colorFor(p, displaced){
    if (displaced) return '#7fe3ff';
    if (p.line === LINES.length - 1){
      // final line — dimmer, matching the reference's faded last line
      const dim = ['#8a8f95', '#6e7378', '#9aa0a6'];
      return dim[Math.floor(p.shade * dim.length) % dim.length];
    }
    const stops = ['#f4f6f8', '#c3c8cd', '#8b9096', '#dfe2e5', '#9aa0a6'];
    return stops[Math.floor(p.shade * stops.length) % stops.length];
  }

  function frame(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    const mx = mouse.active ? mouse.x * dpr : -9999;
    const my = mouse.active ? mouse.y * dpr : -9999;
    const REPEL = 66 * dpr;

    for (let i=0; i<particles.length; i++){
      const p = particles[i];
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < REPEL){
        const force = (1 - dist / REPEL) * 3.2;
        const ang = Math.atan2(dy, dx);
        p.vx += Math.cos(ang) * force;
        p.vy += Math.sin(ang) * force;
      }

      p.vx += (p.homeX - p.x) * 0.03;
      p.vy += (p.homeY - p.y) * 0.03;
      p.vx *= 0.82;
      p.vy *= 0.82;
      p.x += p.vx;
      p.y += p.vy;

      const displaced = dist < REPEL;
      ctx.beginPath();
      ctx.fillStyle = colorFor(p, displaced);
      ctx.arc(p.x/dpr, p.y/dpr, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  wrap.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  wrap.addEventListener('mouseleave', () => { mouse.active = false; });

  function init(){ buildParticles(); }
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(init);
  } else {
    init();
  }
  window.addEventListener('resize', init);

  frame();
})();

/* --------------------------------------------------------------------------
   14. TYPEWRITER COPY — right-hand paragraphs retype on hover
   -------------------------------------------------------------------------- */
(function typewriterCopy(){
  const paras = document.querySelectorAll('.exp-copy .typewriter');
  if (!paras.length) return;

  const timers = new WeakMap();

  paras.forEach(p => {
    const full = p.dataset.full || '';
    p.textContent = full; // sensible default before any interaction

    p.addEventListener('mouseenter', () => {
      if (timers.has(p)) clearInterval(timers.get(p));
      p.classList.add('typing');
      p.textContent = '';
      let i = 0;
      const id = setInterval(() => {
        p.textContent = full.slice(0, i);
        i++;
        if (i > full.length){
          clearInterval(id);
          p.classList.remove('typing');
          p.textContent = full;
        }
      }, 14);
      timers.set(p, id);
    });
  });
})();

/* --------------------------------------------------------------------------
   15. MATRIX RAIN — ambient background behind the expertise copy
   -------------------------------------------------------------------------- */
(function matrixRain(){
  const canvas = document.getElementById('matrixRain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const GLYPHS = '01アイウエオカキクケコ$#%&+=<>SECURE';
  let cols = [];
  let fontSize = 15;
  let W = 0, H = 0;

  function size(){
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.floor(W / fontSize);
    cols = new Array(count).fill(0).map(() => Math.floor(Math.random() * -40));
  }

  function draw(){
    ctx.fillStyle = 'rgba(10,10,10,0.14)';
    ctx.fillRect(0,0,W,H);
    ctx.font = fontSize + 'px monospace';

    for (let i=0; i<cols.length; i++){
      const char = GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      const x = i * fontSize;
      const y = cols[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.96 ? '#ffffff' : 'rgba(58,214,255,0.55)';
      ctx.fillText(char, x, y);

      if (y > H && Math.random() > 0.975) cols[i] = 0;
      else cols[i]++;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', size);
  size();
  draw();
})();

/* --------------------------------------------------------------------------
   16. SKILLS SECTION — bug arrival trigger + speed readout
   -------------------------------------------------------------------------- */
(function skillsTrigger(){
  const section = document.getElementById('skills');
  const speedVal = document.getElementById('speedoVal');
  if (!section) return;

  function animateSpeed(){
    if (!speedVal) return;
    const from = 46;
    const duration = 2500;
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from * (1 - eased));
      speedVal.textContent = String(val).padStart(2, '0');
      if (t < 1) requestAnimationFrame(step);
      else speedVal.textContent = '00';
    }
    requestAnimationFrame(step);
  }

  function play(){
    section.classList.remove('play');
    void section.offsetWidth;
    section.classList.add('play');
    animateSpeed();
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        play();
      } else {
        section.classList.remove('play');
      }
    });
  }, { threshold:.3 });

  io.observe(section);
})();

/* --------------------------------------------------------------------------
   17. SKILLS GRID — six expertise categories, generated from data.
   Hand-drawn generic SVG pictograms (not brand marks), so no image
   placeholders are needed for this section.
   -------------------------------------------------------------------------- */
(function skillsGrid(){
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;

  const R = '#ff2438';
  const ICONS = {
    fingerprint: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round"><path d="M24 8a16 16 0 0 1 16 16v6"/><path d="M24 8a16 16 0 0 0-16 16v6"/><path d="M24 14a10 10 0 0 1 10 10v8"/><path d="M24 14a10 10 0 0 0-10 10v8"/><path d="M24 20a4 4 0 0 1 4 4v10"/><path d="M24 20a4 4 0 0 0-4 4v10"/><circle cx="24" cy="24" r="2" fill="${R}" stroke="none"/></svg>`,
    detective: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c0-6 5-10 12-10s12 4 12 10" /><path d="M8 20h32l-3 5H11z"/><circle cx="20" cy="30" r="6"/><line x1="24.5" y1="34.5" x2="30" y2="40"/></svg>`,
    shield: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6l14 5v11c0 9-6 15-14 20-8-5-14-11-14-20V11z"/><line x1="17" y1="18" x2="27" y2="28"/><line x1="27" y1="18" x2="17" y2="28"/></svg>`,
    code: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="17,14 7,24 17,34"/><polyline points="31,14 41,24 31,34"/><line x1="27" y1="10" x2="21" y2="38"/></svg>`,
    flask: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6h10"/><path d="M20 6v12L10 37a3 3 0 0 0 3 5h22a3 3 0 0 0 3-5L28 18V6"/><line x1="15" y1="30" x2="33" y2="30"/><circle cx="20" cy="35" r="1.4" fill="${R}" stroke="none"/><circle cx="26" cy="37" r="1" fill="${R}" stroke="none"/></svg>`,
    brain: `<svg viewBox="0 0 48 48" fill="none" stroke="${R}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8a6 6 0 0 0-6 6 5 5 0 0 0-3 9 5 5 0 0 0 3 9h6z"/><path d="M28 8a6 6 0 0 1 6 6 5 5 0 0 1 3 9 5 5 0 0 1-3 9h-6z"/><line x1="24" y1="8" x2="24" y2="40"/><circle cx="14" cy="16" r="1.3" fill="${R}" stroke="none"/><circle cx="34" cy="24" r="1.3" fill="${R}" stroke="none"/><circle cx="16" cy="30" r="1.3" fill="${R}" stroke="none"/></svg>`,
  };

  const CATEGORIES = [
    {
      title:'DIGITAL FORENSICS', icon:ICONS.fingerprint,
      desc:'Recovering, preserving, and analyzing digital evidence to uncover the truth and support investigations.',
      list:['Computer forensics','Mobile device forensics','Cloud Forensics','Memory forensics','Network forensics','Malware-related investigations']
    },
    {
      title:'CYBERCRIME INVESTIGATION', icon:ICONS.detective,
      desc:'Investigating cyber-enabled crimes through evidence analysis, intelligence, and digital reconstruction.',
      list:['Digital evidence reconstruction','Threat actor behavior','Online investigations','OSINT','Cyber threat intelligence','Behavioral analysis']
    },
    {
      title:'ETHICAL HACKING & OFFENSIVE SECURITY', icon:ICONS.shield,
      desc:'Proactively identifying weaknesses and strengthening systems through ethical hacking and security testing.',
      list:['Reconnaissance','Network enumeration','Vulnerability assessment','Web application security','API security','Network security']
    },
    {
      title:'FULL-STACK DEVELOPMENT', icon:ICONS.code,
      desc:'Building secure, scalable, and high-performance web solutions from end to end.',
      list:['Frontend development','Backend engineering','Web application architecture','APIs','Databases','Authentication systems','Secure application design','Deployment','Infrastructure security']
    },
    {
      title:'SECURITY RESEARCH', icon:ICONS.flask,
      desc:'Security research is where curiosity becomes methodology. I am interested in investigating emerging technologies, security mechanisms, attack surfaces, forensic artifacts, adversarial techniques, and the evolving relationship between attackers and defensive technologies.',
      list:[]
    },
    {
      title:'AI / ML SECURITY', icon:ICONS.brain,
      desc:'',
      list:['Adversarial machine learning','AI attack surfaces','Model security','Prompt injection','AI-assisted cyber operations','AI for threat detection','AI-assisted digital investigations','Automated malware analysis']
    },
  ];

  const GLYPHS = "!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function scrambleOnHover(el){
    const original = el.textContent;
    let iteration = 0;
    let id = null;
    el.addEventListener('mouseenter', () => {
      if (id) clearInterval(id);
      id = setInterval(() => {
        el.textContent = original.split('').map((ch, i) => {
          if (ch === ' ' || ch === '/') return ch;
          if (i < iteration) return original[i];
          return GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
        }).join('');
        iteration += 0.9;
        if (iteration >= original.length){
          clearInterval(id);
          el.textContent = original;
          iteration = 0;
        }
      }, 30);
    });
  }

  CATEGORIES.forEach((cat) => {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const listHTML = cat.list.length
      ? `<ul class="skill-list">${cat.list.map(li => `<li>${li}</li>`).join('')}</ul>`
      : '';
    const descHTML = cat.desc ? `<p class="skill-desc">${cat.desc}</p>` : '';

    card.innerHTML = `
      <div class="skill-icon">${cat.icon}</div>
      <h3 class="skill-title">${cat.title}</h3>
      <div class="skill-rule"></div>
      ${descHTML}
      ${listHTML}
    `;
    grid.appendChild(card);
    scrambleOnHover(card.querySelector('.skill-title'));
  });

  // stagger reveal as cards enter view
  const cardEls = grid.querySelectorAll('.skill-card');
  const cardIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const idx = Array.from(cardEls).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('in'), idx * 90);
        cardIO.unobserve(entry.target);
      }
    });
  }, { threshold:.2 });
  cardEls.forEach(el => cardIO.observe(el));

  /* -------- carousel controls -------- */
  const wrap = document.querySelector('.skills-grid-wrap');
  const leftArrow = document.getElementById('skillsArrowLeft');
  const rightArrow = document.getElementById('skillsArrowRight');
  const dotsWrap = document.getElementById('skillsDots');

  function buildDots(){
    dotsWrap.innerHTML = '';
    const perView = Math.max(1, Math.round(grid.clientWidth / cardEls[0].getBoundingClientRect().width));
    const pages = Math.max(1, Math.ceil(cardEls.length / perView));
    for (let i=0; i<pages; i++){
      const dot = document.createElement('span');
      dot.className = 'sd' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        grid.scrollTo({ left: i * grid.clientWidth, behavior:'smooth' });
      });
      dotsWrap.appendChild(dot);
    }
    const hasOverflow = grid.scrollWidth > grid.clientWidth + 4;
    leftArrow.style.display = hasOverflow ? 'flex' : 'none';
    rightArrow.style.display = hasOverflow ? 'flex' : 'none';
    dotsWrap.style.display = hasOverflow && pages > 1 ? 'flex' : 'none';
  }

  function updateActiveDot(){
    const dots = dotsWrap.querySelectorAll('.sd');
    if (!dots.length) return;
    const page = Math.round(grid.scrollLeft / grid.clientWidth);
    dots.forEach((d,i) => d.classList.toggle('active', i === page));
  }

  leftArrow.addEventListener('click', () => grid.scrollBy({ left:-grid.clientWidth, behavior:'smooth' }));
  rightArrow.addEventListener('click', () => grid.scrollBy({ left:grid.clientWidth, behavior:'smooth' }));
  grid.addEventListener('scroll', () => { updateActiveDot(); }, { passive:true });
  window.addEventListener('resize', buildDots);

  setTimeout(buildDots, 60);
})();
