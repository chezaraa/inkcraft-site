(() => {
  const WA = '34624530362';
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const T = {
    ru: { quiz: 'Здравствуйте! Вот мои ответы на опросник:', q: (n, t) => `Вопрос ${n} из ${t}`, all: 'Все ответы', close: 'Закрыть', prev: 'Предыдущее фото', next: 'Следующее фото' },
    es: { quiz: 'Hola, estas son mis respuestas al cuestionario:', q: (n, t) => `Pregunta ${n} de ${t}`, all: 'Todas las respuestas', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente' },
    en: { quiz: 'Hello, here are my answers to the questionnaire:', q: (n, t) => `Question ${n} of ${t}`, all: 'All answers', close: 'Close', prev: 'Previous photo', next: 'Next photo' },
  };
  const L = T[document.documentElement.lang] || T.ru;


  // Статистика: Cloudflare Web Analytics (без cookies, баннер не нужен)
  const CF_TOKEN = '86b8ef4d6da44689a3b7cf97aef93d0c';
  const cfBeacon = (doc) => {
    if (!CF_TOKEN) return;
    const sc = doc.createElement('script');
    sc.defer = true;
    sc.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    sc.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
    doc.body.appendChild(sc);
  };
  cfBeacon(document);

  // Google Реклама: тег грузится только после согласия на cookies.
  // Конверсия «Контакт» — нажатие WhatsApp, телефона или отправка опросника.
  const AW_ID = 'AW-18583274287';
  const AW_LEAD = AW_ID + '/0OxpCIq2gbsdEK-GmZ1F';
  const CONSENT_KEY = 'ink_consent';
  const CT = {
    ru: { text: 'Мы используем cookies Google Рекламы, чтобы понимать, какая реклама приводит к нам клиентов.', yes: 'Принять', no: 'Отказаться' },
    es: { text: 'Usamos cookies de Google Ads para saber qué anuncios nos traen clientes.', yes: 'Aceptar', no: 'Rechazar' },
    en: { text: 'We use Google Ads cookies to see which ads bring us clients.', yes: 'Accept', no: 'Decline' },
  };
  const CL = CT[document.documentElement.lang] || CT.ru;
  const store = {
    get: () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } },
    set: (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* без хранилища — спросим снова */ } },
  };
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  let awOn = false;
  const awLoad = () => {
    if (awOn) return;
    awOn = true;
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' });
    gtag('js', new Date());
    gtag('config', AW_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + AW_ID;
    document.head.appendChild(s);
  };
  const lead = () => { if (awOn) gtag('event', 'conversion', { send_to: AW_LEAD }); };
  const consent = store.get();
  if (consent === 'yes') awLoad();
  else if (consent !== 'no') {
    const st = document.createElement('style');
    st.textContent = '.ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:1000;max-width:560px;margin:0 auto;padding:14px 16px;background:#1d1d1b;color:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.25);font-size:14px;line-height:1.45;display:flex;flex-wrap:wrap;gap:10px;align-items:center}.ck p{margin:0;flex:1 1 240px}.ck button{font:inherit;border:0;border-radius:8px;padding:9px 16px;cursor:pointer}.ck__yes{background:#fff;color:#1d1d1b;font-weight:600}.ck__no{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5)!important}';
    document.head.appendChild(st);
    const bar = document.createElement('div');
    bar.className = 'ck';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookies');
    const p = document.createElement('p'); p.textContent = CL.text;
    const yes = document.createElement('button'); yes.type = 'button'; yes.className = 'ck__yes'; yes.textContent = CL.yes;
    const no = document.createElement('button'); no.type = 'button'; no.className = 'ck__no'; no.textContent = CL.no;
    bar.append(p, no, yes);
    document.body.appendChild(bar);
    yes.addEventListener('click', () => { store.set('yes'); bar.remove(); awLoad(); });
    no.addEventListener('click', () => { store.set('no'); bar.remove(); });
  }

  // Нажатие на телефон — конверсия в Google Рекламе
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('a[href^="tel:"]')) lead();
  }, true);

  // Нажатие на WhatsApp: конверсия в Google Рекламе + просмотр служебной страницы /wa/ для Cloudflare
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="https://wa.me"]');
    if (!a) return;
    lead();
    if (!CF_TOKEN) return;
    const f = document.createElement('iframe');
    f.src = '/wa/';
    f.hidden = true;
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    document.body.appendChild(f);
  }, true);

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
      lead();
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
