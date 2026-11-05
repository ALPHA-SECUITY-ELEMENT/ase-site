
/*
  ASE // PAGE TRANSITIONS
  Fixed same-page anchor navigation
  Prevents black-screen navigation issues
*/

(() => {
  'use strict';

  document.body.classList.add('transition-ready');

  const restorePage = () => {
    document.body.style.transition = '';
    document.body.style.opacity = '1';
  };

  const isInternal = (a) => {
    if (!a || !a.href) return false;

    if (a.target === '_blank' || a.hasAttribute('download')) {
      return false;
    }

    if (a.protocol === 'mailto:' || a.protocol === 'tel:') {
      return false;
    }

    try {
      const url = new URL(a.href, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const isSamePage = (url) => {
    return (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    );
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;

    const anchor = event.target.closest('a[href]');

    if (!isInternal(anchor)) return;

    // Preserve browser shortcuts:
    // Ctrl+click, Shift+click, middle click, etc.
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = new URL(
      anchor.href,
      window.location.href
    );

    // Same-page navigation must never fade the page.
    if (isSamePage(destination)) {
      restorePage();

      // Let the browser handle the hash normally.
      // This also preserves browser history.
      return;
    }

    event.preventDefault();

    document.body.style.transition =
      'opacity .45s cubic-bezier(.22,.61,.36,1)';

    document.body.style.opacity = '0';

    setTimeout(() => {
      window.location.assign(destination.href);
    }, 460);
  });

  // Restore visibility after browser back/forward navigation.
  window.addEventListener('pageshow', restorePage);

  // Restore visibility when returning to the tab.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      restorePage();
    }
  });

  // Ensure initial page visibility.
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      restorePage,
      { once: true }
    );
  } else {
    restorePage();
  }
})();
