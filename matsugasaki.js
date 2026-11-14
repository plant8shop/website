(() => {
  function init() {
    const project = document.querySelector('.plant-project');
    const dialog = document.querySelector('.plant-lightbox');
    if (!project || !dialog || typeof dialog.showModal !== 'function') return;
    const image = dialog.querySelector('img');
    const zoom = dialog.querySelector('[data-plant-zoom]');
    const viewport = dialog.querySelector('.plant-lightbox-viewport');
    let previousOverflow = '';
    project.addEventListener('click', event => {
      const link = event.target.closest('[data-plant-image]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      image.alt = link.querySelector('img').alt;
      image.src = link.href;
      dialog.classList.remove('is-zoomed');
      zoom.textContent = '＋';
      zoom.setAttribute('aria-label', '画像を拡大');
      zoom.setAttribute('aria-pressed', 'false');
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
    });
    dialog.querySelector('[data-plant-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = previousOverflow;
      dialog.classList.remove('is-zoomed');
      image.removeAttribute('src');
    });
    zoom.addEventListener('click', () => {
      const active = dialog.classList.toggle('is-zoomed');
      zoom.textContent = active ? '−' : '＋';
      zoom.setAttribute('aria-label', active ? '画像を全体表示' : '画像を拡大');
      zoom.setAttribute('aria-pressed', String(active));
      viewport.scrollTop = 0;
      viewport.scrollLeft = 0;
    });
    if (/^#site-0[1-7]$/.test(location.hash)) {
      document.querySelector(location.hash)?.scrollIntoView({ block: 'start' });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
