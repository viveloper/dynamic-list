// utility function

// TODO: 설명
export const sumParentScrollOffset = (el) => {
  if (!el) return [0, 0];
  const [scrollLeft, scrollTop] = sumParentScrollOffset(el.parentElement);
  return [(el.scrollLeft ?? 0) + scrollLeft, (el.scrollTop ?? 0) + scrollTop];
};
