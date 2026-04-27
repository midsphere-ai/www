// Reading-progress bar for the blog post layout. Scales the lime fill bar
// at the top of the viewport based on how far the article has been scrolled.
export function initBlogReadingProgress(): () => void {
  const fill = document.getElementById('reading-progress-fill');
  const article = document.querySelector('article');
  if (!fill || !article) return () => {};

  let ticking = false;
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    const pct = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
    fill.style.transform = `scaleX(${pct})`;
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
