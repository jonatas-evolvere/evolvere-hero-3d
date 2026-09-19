/* V14.1: one shared load origin for reveal and the 3-second shine delay. */
(() => {
  const start = () => document.documentElement.classList.add('hero-ready');
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
