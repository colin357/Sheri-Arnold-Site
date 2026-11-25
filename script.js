(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* header state */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile nav */
  const nav = $('.nav');
  const toggle = $('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#nav-list a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  /* reveal on scroll */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* count-up numbers */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $$('[data-count]').forEach(el => countIO.observe(el));

  /* approach cycle */
  const steps = $$('#steps li');
  const arc = $('#cycleArc');
  const dots = $$('.cycle-dots circle');
  const label = $('#cycleLabel');
  const year = $('#cycleYear');
  const C = 2 * Math.PI * 160;
  let active = 0, timer, cycles = 1;
  const setStep = (i, user) => {
    if (i === 0 && active === 3 && !user) cycles++;
    active = i;
    steps.forEach((li, n) => li.classList.toggle('is-active', n === i));
    dots.forEach((d, n) => d.classList.toggle('on', n <= i));
    arc.style.strokeDashoffset = C * (1 - i / 4);
    label.textContent = $('.step-t', steps[i]).textContent;
    year.textContent = cycles;
  };
  const auto = () => { clearInterval(timer); timer = setInterval(() => setStep((active + 1) % 4), 4200); };
  steps.forEach((li, i) => $('button', li).addEventListener('click', () => { setStep(i, true); auto(); }));
  const cycleIO = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { setStep(active); auto(); } else clearInterval(timer);
  }, { threshold: 0.3 });
  cycleIO.observe($('#approach'));

  /* loan filters */
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.toggle('is-on', c === chip));
    const f = chip.dataset.filter;
    $$('.loan-list li').forEach(li => {
      li.classList.toggle('is-hidden', f !== 'all' && !li.dataset.tags.split(' ').includes(f));
    });
  }));

  /* calculator */
  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
  const price = $('#price'), down = $('#down'), rate = $('#rate');
  const paint = r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
  const calc = () => {
    const P = +price.value, d = +down.value, r = +rate.value;
    const term = +$('input[name=term]:checked').value;
    const loan = P * (1 - d / 100), i = r / 100 / 12, n = term * 12;
    const pi = i ? loan * i / (1 - Math.pow(1 + i, -n)) : loan / n;
    const tax = P * 0.011 / 12, ins = 1800 / 12, total = pi + tax + ins;
    $('#vPrice').textContent = fmt(P);
    $('#vDown').textContent = `${d}% · ${fmt(P * d / 100)}`;
    $('#vRate').textContent = r.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '%';
    $('#calcTotal').textContent = fmt(total);
    $('#outPI').textContent = fmt(pi);
    $('#outTax').textContent = fmt(tax);
    $('#outIns').textContent = fmt(ins);
    const [a, b, c] = $$('#calcBar .seg');
    a.style.flexBasis = (pi / total * 100) + '%';
    b.style.flexBasis = (tax / total * 100) + '%';
    c.style.flexBasis = (ins / total * 100) + '%';
    [price, down, rate].forEach(paint);
  };
  $('#calcForm').addEventListener('input', calc);
  calc();

  /* testimonials */
  const qs = $$('.q');
  let qi = 0;
  const showQ = i => {
    qi = (i + qs.length) % qs.length;
    qs.forEach((q, n) => q.classList.toggle('is-on', n === qi));
    $('#qIdx').textContent = qi + 1;
  };
  $('#qPrev').addEventListener('click', () => showQ(qi - 1));
  $('#qNext').addEventListener('click', () => showQ(qi + 1));

  /* contact form -> email draft (static site, no backend) */
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `Website inquiry: ${f.get('goal')}`;
    const body = `Name: ${f.get('name')}\nPhone: ${f.get('phone')}\nEmail: ${f.get('email')}\nLooking to: ${f.get('goal')}\n\n${f.get('story')}`;
    window.location.href = `mailto:sheri.arnold@fairwaymc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  $('#yr').textContent = new Date().getFullYear();
})();
