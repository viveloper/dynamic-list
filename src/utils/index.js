export const sumParentScrollOffset = (el) => {
  if (!el) return [0, 0];
  const [scrollLeft, scrollTop] = sumParentScrollOffset(el.parentElement);
  return [(el.scrollLeft ?? 0) + scrollLeft, (el.scrollTop ?? 0) + scrollTop];
};

export const getMaxZIndex = () => {
  return Math.max(
    ...Array.from(document.querySelectorAll('body *'), (el) =>
      parseFloat(window.getComputedStyle(el).zIndex)
    ).filter((zIndex) => !Number.isNaN(zIndex)),
    0
  );
};

const preventDefault = (e) => {
  e.preventDefault();
};

const preventDefaultForScrollKeys = (e) => {
  const scrollKeys = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    ' ',
  ];
  if (scrollKeys.includes(e.key)) {
    preventDefault(e);
  }
};

export const disableScroll = () => {
  window.addEventListener('wheel', preventDefault, { passive: false });
  window.addEventListener('keydown', preventDefaultForScrollKeys);
  window.addEventListener('touchmove', preventDefault, { passive: false });
};

export const enableScroll = () => {
  window.removeEventListener('wheel', preventDefault, { passive: false });
  window.removeEventListener('keydown', preventDefaultForScrollKeys);
  window.removeEventListener('touchmove', preventDefault, { passive: false });
};
