const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const preference = window.matchMedia('(prefers-color-scheme: dark)');
function currentTheme() {
  return root.dataset.theme || (preference.matches ? 'dark' : 'light');
}
function updateThemeControl() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
}
try {
  const saved = localStorage.getItem('stella-theme');
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
} catch { /* Theme still works when storage is unavailable. */ }
if (themeButton) {
  themeButton.hidden = false;
  updateThemeControl();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('stella-theme', root.dataset.theme); } catch {}
    updateThemeControl();
  });
  preference.addEventListener('change', updateThemeControl);
}
// The header gains a hairline and a frosted background once the page scrolls under it.
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
