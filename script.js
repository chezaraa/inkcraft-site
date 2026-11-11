(() => {
  const WA = '34624530362';
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const T = {
    ru: { quiz: 'Здравствуйте! Вот мои ответы на опросник:', q: (n, t) => `Вопрос ${n} из ${t}`, all: 'Все ответы', close: 'Закрыть', prev: 'Предыдущее фото', next: 'Следующее фото' },
    es: { quiz: 'Hola, estas son mis respuestas al cuestionario:', q: (n, t) => `Pregunta ${n} de ${t}`, all: 'Todas las respuestas', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente' },
    en: { quiz: 'Hello, here are my answers to the questionnaire:', q: (n, t) => `Question ${n} of ${t}`, all: 'All answers', close: 'Close', prev: 'Previous photo', next: 'Next photo' },
  };
  const L = T[document.documentElement.lang] || T.ru;

  // WhatsApp-ссылки с готовым текстом
  document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });

  // Было / стало: ползунок
  document.querySelectorAll('[data-ba]').forEach((box) => {
    const r = box.querySelector('.ba__range');
    const set = () => box.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set); set();
  });

  // Опросник: по одному вопросу, автопереход после выбора
  const quiz = document.getElementById('quiz');
  if (quiz) {
    const steps = [...quiz.querySelectorAll('fieldset.q')];
    const final = quiz.querySelector('[data-final]');
    const bar = document.getElementById('quizBar');
    const count = document.getElementById('quizCount');
    const back = document.getElementById('quizBack');
    const sum = document.getElementById('quizSum');
    // Ветки: вопросы с data-for показываются только для выбранного варианта в первом вопросе
    let path = steps.filter((s) => !s.dataset.for);
    let i = 0;
    const branch = () => { const c = steps[0].querySelector('input:checked'); return c ? c.dataset.branch : 'flat'; };
    const rebuild = () => {
      const b = branch();
      path = steps.filter((s) => !s.dataset.for || (b && s.dataset.for.split(' ').includes(b)));
    };
    const answers = () => path.map((s) => {
      const c = s.querySelector('input:checked');
      return [s.dataset.q, c ? c.value : '—'];
    });
    const show = (n) => {
      i = n;
      const total = path.length;
      steps.forEach((s) => s.classList.toggle('is-active', s === path[n]));
      const done = n >= total;
      final.classList.toggle('is-active', done);
      bar.style.width = (done ? 100 : ((n + 1) / total) * 100) + '%';
      count.textContent = done ? L.all : L.q(n + 1, total);
      back.hidden = n === 0;
      if (done) sum.innerHTML = answers().map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`).join('');
    };
    steps.forEach((s) => s.addEventListener('change', () => {
      if (s === steps[0]) rebuild();
      setTimeout(() => show(path.indexOf(s) + 1), 180);
    }));
    back.addEventListener('click', () => show(Math.max(0, i - 1)));
    rebuild();
    quiz.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = L.quiz + '\n' + answers().map(([k, v]) => `• ${k}: ${v}`).join('\n');
      window.open(waLink(text), '_blank', 'noopener');
    });
    show(0);
  }

  // Кнопка WhatsApp на телефоне появляется после первого экрана
  const sticky = document.querySelector('.sticky');
  const hero = document.querySelector('.hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    const hide = new Set(['hero']);
    const watch = { hero, calc: document.getElementById('calc'), final: document.querySelector('.final') };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { const k = e.target.dataset.watch; if (e.isIntersecting) hide.add(k); else hide.delete(k); });
      sticky.classList.toggle('is-on', hide.size === 0);
    }, { threshold: 0.1 });
    Object.entries(watch).forEach(([k, el]) => { if (el) { el.dataset.watch = k; io.observe(el); } });
  }

  // Галереи «Наши работы»: полный экран, своя серия у каждой карточки
  const cards = document.querySelectorAll('figure[data-photos]');
  if (cards.length) {
    const box = document.createElement('div');
    box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = `<button class="lb__close" type="button" aria-label="${L.close}">×</button>
      <button class="lb__nav lb__nav--prev" type="button" aria-label="${L.prev}">‹</button>
      <img class="lb__img" alt="">
      <button class="lb__nav lb__nav--next" type="button" aria-label="${L.next}">›</button>
      <p class="lb__cap"></p>`;
    document.body.appendChild(box);
    const img = box.querySelector('.lb__img'), cap = box.querySelector('.lb__cap');
    const prevB = box.querySelector('.lb__nav--prev'), nextB = box.querySelector('.lb__nav--next');
    let list = [], k = 0, title = '', last = null;
    const draw = () => {
      img.src = list[k];
      cap.textContent = list.length > 1 ? `${title} · ${k + 1} / ${list.length}` : title;
      prevB.hidden = nextB.hidden = list.length < 2;
      if (list[k + 1]) new Image().src = list[k + 1];
    };
    const go = (d) => { if (list.length > 1) { k = (k + d + list.length) % list.length; draw(); } };
    const open = (fig) => {
      const base = fig.querySelector('img').getAttribute('src').replace(/[^/]+$/, '') + 'gal/';
      list = fig.dataset.photos.split(' ').map((n) => base + n + '.webp');
      title = fig.querySelector('figcaption').textContent; k = 0; last = fig;
      draw(); box.hidden = false; document.documentElement.classList.add('lb-open');
      box.querySelector('.lb__close').focus();
    };
    const close = () => { box.hidden = true; document.documentElement.classList.remove('lb-open'); img.removeAttribute('src'); if (last) last.focus(); };
    cards.forEach((fig) => {
      fig.addEventListener('click', () => open(fig));
      fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(fig); } });
    });
    box.querySelector('.lb__close').addEventListener('click', close);
    prevB.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
    nextB.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1);
    });
    let sx = 0, sy = 0;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close();
    }, { passive: true });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
