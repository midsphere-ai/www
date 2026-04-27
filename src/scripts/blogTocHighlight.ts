// Active-section TOC highlighter. Tracks which article h2 is currently in view
// and adds .is-active to the matching TOC link.
export function initBlogTocHighlight(): () => void {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]');
  if (!links.length || !('IntersectionObserver' in window)) return () => {};

  const bySlug: Record<string, HTMLAnchorElement> = {};
  links.forEach((a) => {
    const slug = a.getAttribute('data-toc-link');
    if (slug) bySlug[slug] = a;
  });

  const headings = Array.from(document.querySelectorAll<HTMLElement>('article h2'))
    .filter((h) => h.id && bySlug[h.id]);
  if (!headings.length) return () => {};

  const visible: Record<string, boolean> = {};
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { visible[e.target.id] = e.isIntersecting; });
    const firstVisible = headings.find((h) => visible[h.id]);
    let activeId: string | null = firstVisible ? firstVisible.id : null;
    if (!activeId) {
      // fall back to the last heading whose top is above the trigger line
      const trigger = window.innerHeight * 0.25;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].getBoundingClientRect().top <= trigger) {
          activeId = headings[i].id;
          break;
        }
      }
    }
    links.forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('data-toc-link') === activeId);
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

  headings.forEach((h) => io.observe(h));
  return () => io.disconnect();
}
