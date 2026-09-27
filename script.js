(() => {
  const WA_NUMBER = '34624530362';

  // WhatsApp-ссылки с готовым текстом сообщения
  document.querySelectorAll('[data-wa]').forEach((a) => {
    const text = `Здравствуйте! ${a.dataset.wa}`;
    a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  });

  // Шапка: фон при прокрутке
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Мобильное меню
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    if (open) header.classList.add('is-scrolled'); else onScroll();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Фиксированная кнопка WhatsApp: видна после первого экрана, скрыта у финального CTA
  const sticky = document.querySelector('.sticky-wa');
  const hero = document.querySelector('.hero');
  const final = document.querySelector('.final');
  if ('IntersectionObserver' in window) {
    const state = { hero: true, final: false };
    const update = () => sticky.classList.toggle('is-visible', !state.hero && !state.final);
    new IntersectionObserver(([e]) => { state.hero = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(([e]) => { state.final = e.isIntersecting; update(); }, { threshold: 0.2 }).observe(final);
  } else {
    sticky.classList.add('is-visible');
  }

  // До / Процесс / После
  const LABELS = { before: 'До', process: 'Процесс', after: 'После' };
  const ORDER = ['before', 'process', 'after'];
  document.querySelectorAll('[data-case]').forEach((c) => {
    const frames = c.querySelectorAll('[data-step]');
    const tabs = c.querySelectorAll('[data-go]');
    const badge = c.querySelector('.case__badge');
    let current = 'after';
    const show = (step) => {
      current = step;
      frames.forEach((f) => f.classList.toggle('is-active', f.dataset.step === step));
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.go === step)));
      badge.textContent = LABELS[step];
      badge.dataset.step = step;
    };
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.go)));
    show(current);

    // Свайп по фото
    const stage = c.querySelector('.case__stage');
    let x0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      const i = ORDER.indexOf(current) + (dx < 0 ? 1 : -1);
      if (i >= 0 && i < ORDER.length) show(ORDER[i]);
    });
  });

  // Фильтр галереи
  const chips = document.querySelectorAll('.chip');
  const items = document.querySelectorAll('.gallery li');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.toggle('is-active', c === chip));
    const f = chip.dataset.filter;
    items.forEach((li) => { li.hidden = f !== 'all' && li.dataset.cat !== f; });
  }));

  // Просмотр фото
  const lb = document.querySelector('.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = lb.querySelector('img');
    document.querySelector('.gallery').addEventListener('click', (e) => {
      const img = e.target.closest('.media')?.querySelector('img');
      if (!img) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.showModal();
    });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lightbox__close')) lb.close(); });
  }

  // Отзывы: показываем блок, только если есть настоящие отзывы
  const reviews = document.getElementById('reviews');
  if (reviews && reviews.querySelector('.review')) reviews.hidden = false;

  // Соцсети без ссылки не показываем
  document.querySelectorAll('[data-social]').forEach((a) => {
    if (!a.getAttribute('href') || a.getAttribute('href') === '#') a.hidden = true;
  });

  // Плавное появление блоков
  const revealTargets = document.querySelectorAll('.section__head, .service, .case, .stat, .trust li, .remote__text, .remote__visual, .process li, .final__inner');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
