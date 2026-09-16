// fade-out on internal link navigation — smooth page transitions
(() => {
  document.body.classList.add('transition-ready');

  const isInternal = a => {
    if (!a || !a.href) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    if (a.href.startsWith('mailto:') || a.href.startsWith('tel:')) return false;
    try {
      const u = new URL(a.href);
      return u.origin === location.origin;
    } catch { return false; }
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!isInternal(a)) return;
    e.preventDefault();
    document.body.style.transition = 'opacity .45s cubic-bezier(.22,.61,.36,1)';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = a.href; }, 460);
  });

  window.addEventListener('pageshow', () => {
    document.body.style.opacity = '1';
  });
})();