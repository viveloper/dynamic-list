/**
 * Get viewport position (fixed position) in screen with scroll.
 * @param {HTMLElement} el
 * @returns {[number, number]}
 */
export const sumParentScrollOffset = (el) => {
  if (!el) return [0, 0];
  const [scrollLeft, scrollTop] = sumParentScrollOffset(el.parentElement);
  const totalScrollOffsetLeft = (el.scrollLeft ?? 0) + scrollLeft;
  const totalScrollOffsetTop = (el.scrollTop ?? 0) + scrollTop;
  return [totalScrollOffsetLeft, totalScrollOffsetTop];
};

/**
 * Get the largest z-index of the screen.
 * Reference: https://bobbyhadz.com/blog/javascript-find-highest-z-index-on-page
 */
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

/**
 * Disable Mouse & Touch scroll and Keys associated with scrolling.
 * Reference: https://stackoverflow.com/a/4770179
 */
export const disableScroll = () => {
  window.addEventListener('wheel', preventDefault, { passive: false });
  window.addEventListener('keydown', preventDefaultForScrollKeys);
  window.addEventListener('touchmove', preventDefault, { passive: false });
};

/**
 * Enable Mouse & Touch scroll and Keys associated with scrolling.
 */
export const enableScroll = () => {
  window.removeEventListener('wheel', preventDefault, { passive: false });
  window.removeEventListener('keydown', preventDefaultForScrollKeys);
  window.removeEventListener('touchmove', preventDefault, { passive: false });
};
