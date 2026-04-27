// Rotating-phrase animation for the hero headline. Cycles through `variants`
// while the rotating phrase is in the viewport; pauses when scrolled out so
// it doesn't burn cycles off-screen. Honors prefers-reduced-motion.
//
// Markup contract:
//   <span class="rotating-phrase">
//     <span class="hl rotating-ghost" aria-hidden="true"></span>
//     <span class="rotating-stack">
//       <span class="hl rotating-item">first variant</span>
//     </span>
//   </span>

interface Options {
  rootSelector: string;
  variants: string[];
  displayMs?: number;
  transitionMs?: number;
}

export function initRotatingPhrase({
  rootSelector,
  variants,
  displayMs = 3500,
  transitionMs = 250,
}: Options): () => void {
  const root = document.querySelector(rootSelector);
  if (!root) return () => {};
  const phrase = root.querySelector('.rotating-phrase');
  if (!(phrase instanceof HTMLElement)) return () => {};
  const ghost = phrase.querySelector('.rotating-ghost');
  if (!(ghost instanceof HTMLElement)) return () => {};
  const stack = phrase.querySelector('.rotating-stack');
  if (!(stack instanceof HTMLElement)) return () => {};

  // Measure the ghost (which carries the longest variant in CSS ::before
  // content) and publish its height as a CSS var. Items use this as their
  // min-height so each item fills the clip area exactly — preventing any
  // vertical bleed when a shorter variant is the current one.
  const syncClipHeight = () => {
    const h = ghost.getBoundingClientRect().height;
    if (h > 0) phrase.style.setProperty('--rotator-clip-height', `${h}px`);
  };
  syncClipHeight();
  const resizeObserver = new ResizeObserver(syncClipHeight);
  resizeObserver.observe(ghost);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => resizeObserver.disconnect();
  }

  let currentIndex = 0;
  let inView = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let animating = false;

  function rotate() {
    timer = null;
    if (!inView || animating || !stack) return;
    animating = true;

    const nextIndex = (currentIndex + 1) % variants.length;
    const currentItem = stack.firstElementChild as HTMLElement | null;
    if (!currentItem) { animating = false; return; }

    const nextItem = document.createElement('span');
    nextItem.className = 'hl rotating-item';
    nextItem.textContent = variants[nextIndex];
    stack.appendChild(nextItem);

    stack.style.transition = 'none';
    stack.style.transform = 'translateY(0)';
    void stack.offsetHeight;

    requestAnimationFrame(() => {
      // Slide by the clip height (ghost height) — guaranteed to equal
      // each item's min-height, so the next item lands exactly at y=0.
      const slideDistance = ghost.getBoundingClientRect().height || currentItem.offsetHeight;
      stack.style.transition = `transform ${transitionMs}ms ease-out`;
      stack.style.transform = `translateY(-${slideDistance}px)`;

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        stack.removeEventListener('transitionend', onEnd);
        stack.style.transition = 'none';
        currentItem.remove();
        stack.style.transform = 'translateY(0)';
        currentIndex = nextIndex;
        animating = false;
        if (inView) timer = setTimeout(rotate, displayMs);
      };
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'transform') return;
        cleanup();
      };
      stack.addEventListener('transitionend', onEnd);
      setTimeout(cleanup, transitionMs + 100);
    });
  }

  const start = () => {
    if (inView) return;
    inView = true;
    if (!timer && !animating) timer = setTimeout(rotate, displayMs);
  };
  const stop = () => {
    inView = false;
    if (timer) { clearTimeout(timer); timer = null; }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0 });
  observer.observe(root);

  return () => {
    observer.disconnect();
    resizeObserver.disconnect();
    stop();
  };
}
