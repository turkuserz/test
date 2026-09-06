
(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  let navigating = false;

  // Page is visible immediately; JS only adds a tiny entrance state.
  root.classList.add('page-ready');

  if (reduce) return;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || navigating) return;

    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('javascript:')) return;
    if (link.target === '_blank' || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey) return;

    let url;
    try { url = new URL(raw, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (url.href === location.href) return;

    event.preventDefault();
    navigating = true;
    root.classList.add('page-leaving');

    // Fast enough to feel instant, long enough to feel polished.
    setTimeout(() => location.assign(url.href), 190);
  });

  window.addEventListener('pageshow', () => {
    navigating = false;
    root.classList.remove('page-leaving');
    root.classList.add('page-ready');
  });
})();
