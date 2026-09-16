// loader + scroll reveal + year
(() => {
  const loader = document.getElementById('loader');
  const bar = loader?.querySelector('.loader-bar span');
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const runReveal = () => {
    const els = document.querySelectorAll('[data-anim="fade-up"]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add('in'));
    }
  };

  const finish = () => {
    loader?.classList.add('done');
    document.body.classList.add('ready');
    runReveal();
  };

  if (loader && bar) {
    requestAnimationFrame(() => loader.classList.add('draw'));

    const DURATION = 2200;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / DURATION);
      bar.style.width = (p * 100) + '%';
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 260);
    };
    tick();
  } else {
    document.body.classList.add('ready');
    runReveal();
  }
})();