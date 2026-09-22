/* =========================================================
   delSALVADOR.com — interacciones y animaciones
   ========================================================= */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- Fecha en la barra superior ---------- */
  const fecha = document.getElementById('fecha-hoy');
  if (fecha) {
    const f = new Date().toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    fecha.textContent = 'San Salvador, ' + f;
  }

  /* ---------- Menú móvil ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '✕ CERRAR' : '☰ MENÚ';
    });
  }

  /* ---------- Mapa ASCII de El Salvador ---------- */
  const pre = document.getElementById('ascii');
  if (pre) {
    // Silueta simplificada de El Salvador basada en coordenadas WGS84.
    // Se dibuja como contorno ASCII + puntos interiores para conservar
    // la lectura cartográfica y permitir que los caracteres cambien en vivo.
    const poly = [
      [-87.793111,13.384480], [-87.904112,13.149017], [-88.483302,13.163951],
      [-88.843228,13.259734], [-89.256743,13.458533], [-89.812394,13.520622],
      [-90.095555,13.735338], [-90.064678,13.881970], [-89.721934,14.134228],
      [-89.534219,14.244816], [-89.587343,14.362586], [-89.353326,14.424133],
      [-89.058512,14.340029], [-88.843073,14.140507], [-88.541231,13.980155],
      [-88.503998,13.845486], [-88.065343,13.964626], [-87.859515,13.893312],
      [-87.723503,13.785050]
    ];
    const lonMin = -90.16, lonMax = -87.67, latMin = 13.12, latMax = 14.46;
    const cols = 78, rows = 24;

    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };

    const dx = (lonMax - lonMin) / (cols - 1);
    const dy = (latMax - latMin) / (rows - 1);
    const nearEdge = (x, y) => {
      return !(
        inside(x + dx * 1.45, y) && inside(x - dx * 1.45, y) &&
        inside(x, y + dy * 1.45) && inside(x, y - dy * 1.45)
      );
    };

    const edgeChars = '#%+=*';
    const innerChars = '.:·+*';
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const lon = lonMin + c * dx;
        const lat = latMax - r * dy;
        const land = inside(lon, lat);
        const edge = land && nearEdge(lon, lat);
        const interior = land && !edge && ((r * 17 + c * 31) % 9 < 2);
        const stars = !land && ((r * 19 + c * 11) % 83 === 0);
        row.push({ land, edge, interior, stars });
      }
      grid.push(row);
    }

    const pick = (chars, seed) => chars[(seed + Math.floor(Math.random() * chars.length)) % chars.length];
    const render = () => {
      let html = '';
      grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          const seed = r * 97 + c * 53;
          if (cell.edge) html += '<span class="l">' + pick(edgeChars, seed) + '</span>';
          else if (cell.interior) html += '<span class="l">' + pick(innerChars, seed) + '</span>';
          else if (cell.stars) html += '<span class="d">' + pick('·.+', seed) + '</span>';
          else html += ' ';
        });
        html += '\n';
      });
      pre.innerHTML = html;
    };

    render();
    if (!reduce) setInterval(render, 220);

    // Marcador en San Salvador (aprox. 13.6929°N, 89.2182°W).
    const marker = document.querySelector('.map-marker');
    if (marker) {
      const place = () => {
        const x = (-89.2182 - lonMin) / (lonMax - lonMin);
        const y = (latMax - 13.6929) / (latMax - latMin);
        marker.style.left = (pre.offsetLeft + x * pre.clientWidth) + 'px';
        marker.style.top = (pre.offsetTop + y * pre.clientHeight) + 'px';
      };
      place();
      window.addEventListener('resize', place);
      document.fonts && document.fonts.ready.then(place);
    }
  }

  /* ---------- Animaciones ligadas al scroll ----------
     1) Hero: el contenido se desvanece y se desplaza gradualmente.
     2) [data-scroll]: cada bloque aparece al entrar (sube + se aclara)
        y se desvanece gradualmente al salir por arriba.
     3) [data-parallax]: imágenes que se mueven a distinta velocidad. */
  const header = document.querySelector('.site-header');
  const heroFade = document.querySelectorAll('[data-hero-fade]');
  const items = [...document.querySelectorAll('[data-scroll]')];
  const parallax = [...document.querySelectorAll('[data-parallax]')];

  // Retardo escalonado automático para elementos hermanos
  items.forEach((el) => {
    if (el.dataset.delay) return;
    const sib = [...el.parentElement.children].filter((n) => n.hasAttribute('data-scroll'));
    el.dataset.delay = sib.length > 1 ? (sib.indexOf(el) % 4) : 0;
  });

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 20);

    heroFade.forEach((el) => {
      const speed = parseFloat(el.dataset.heroFade) || 0.35;
      const p = clamp(y / (vh * 0.75), 0, 1);
      el.style.opacity = 1 - p;
      el.style.transform = `translate3d(0, ${y * speed}px, 0) scale(${1 - p * 0.06})`;
      el.style.filter = `blur(${p * 4}px)`;
    });

    const atEnd = y + vh >= document.documentElement.scrollHeight - 4;
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = (+el.dataset.delay || 0) * 50;
      let enter = clamp((vh - r.top - d) / (vh * 0.2), 0, 1);
      if (atEnd && r.top < vh) enter = 1; // al final de la página todo queda visible
      const exit = clamp((r.bottom - vh * 0.08) / (vh * 0.32), 0, 1);
      const o = Math.min(enter, exit);
      const ty = (1 - enter) * 60 - (1 - exit) * 50;
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${(0.95 + 0.05 * o).toFixed(3)})`;
    });

    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const s = parseFloat(el.dataset.parallax) || 0.12;
      const off = (r.top + r.height / 2 - vh / 2) * s;
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.18)`;
    });

    // Progreso del directorio
    const bar = document.querySelector('.dir-aside .progress i');
    if (bar) {
      const main = document.querySelector('.dir-main');
      const r = main.getBoundingClientRect();
      bar.style.width = clamp((vh * 0.4 - r.top) / r.height, 0, 1) * 100 + '%';
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  if (reduce) {
    items.forEach((el) => { el.style.opacity = 1; });
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Contador animado de estadísticas ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, t0 = performance.now();
        const step = (t) => {
          const p = clamp((t - t0) / 1400, 0, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---------- Directorio: filtro y navegación lateral ---------- */
  const filtro = document.getElementById('filtro');
  if (filtro) {
    const groups = [...document.querySelectorAll('.dir-group')];
    const none = document.querySelector('.no-results');
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    filtro.addEventListener('input', () => {
      const q = norm(filtro.value.trim());
      let total = 0;
      groups.forEach((g) => {
        let n = 0;
        g.querySelectorAll('.cat-card').forEach((c) => {
          const ok = !q || norm(c.textContent).includes(q) || norm(g.dataset.name).includes(q);
          c.classList.toggle('hidden', !ok);
          if (ok) n++;
        });
        g.classList.toggle('hidden', n === 0);
        total += n;
      });
      none.classList.toggle('show', total === 0);
      const out = document.getElementById('filtro-count');
      if (out) out.textContent = q ? `${total} categoría(s) encontradas` : 'Escriba para filtrar al instante entre las 41 categorías';
      onScroll();
    });
    // Buscar desde el inicio: directorio.html?q=...
    const q0 = new URLSearchParams(location.search).get('q');
    if (q0) { filtro.value = q0; filtro.dispatchEvent(new Event('input')); }

    const links = document.querySelectorAll('.dir-aside a');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    groups.forEach((g) => spy.observe(g));
  }

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const ok = document.querySelector('.form-success');
    const check = (field) => {
      const input = field.querySelector('input, select, textarea');
      const valid = input.checkValidity();
      field.classList.toggle('invalid', !valid);
      return valid;
    };
    form.querySelectorAll('.field').forEach((f) => {
      const input = f.querySelector('input, select, textarea');
      input.addEventListener('blur', () => check(f));
      input.addEventListener('input', () => f.classList.contains('invalid') && check(f));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('.field')];
      const allOk = fields.map(check).every(Boolean);
      if (!allOk) { ok.classList.remove('show'); return; }
      const nombre = form.nombre.value.split(' ')[0];
      ok.textContent = `✓ Gracias, ${nombre}. Recibimos su solicitud y le responderemos a ${form.email.value}.`;
      ok.classList.add('show');
      form.reset();
    });
  }
})();
