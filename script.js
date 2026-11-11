(() => {
  const WA = '34624530362';
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const T = {
    ru: { hi: 'Здравствуйте!', src: '(с сайта)', quiz: 'Здравствуйте! Прошёл опросник на сайте:', q: (n, t) => `Вопрос ${n} из ${t}`, all: 'Все ответы' },
    es: { hi: 'Hola.', src: '(desde la web)', quiz: 'Hola, he rellenado el cuestionario de la web:', q: (n, t) => `Pregunta ${n} de ${t}`, all: 'Todas las respuestas' },
    en: { hi: 'Hello.', src: '(from the website)', quiz: 'Hello, I filled in the questionnaire on your website:', q: (n, t) => `Question ${n} of ${t}`, all: 'All answers' },
  }[document.documentElement.lang] || null;
  const L = T || { hi: 'Здравствуйте!', src: '(с сайта)', quiz: 'Здравствуйте! Прошёл опросник на сайте:', q: (n, t) => `Вопрос ${n} из ${t}`, all: 'Все ответы' };

  // WhatsApp-ссылки с готовым текстом
  document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(`${L.hi} ${a.dataset.wa} ${L.src}`); });

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

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
