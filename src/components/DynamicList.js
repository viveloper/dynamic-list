import {
  sumParentScrollOffset,
  getMaxZIndex,
  disableScroll,
  enableScroll,
} from '../utils/index.js';

const SELECT_INDENT = 40;
const SELECT_NEIGHBOR_INDENT = 20;
const ANIMATION_DURATION = 500;
const ANIMATION_OPTION = {
  duration: ANIMATION_DURATION,
  easing: 'ease',
  fill: 'forwards',
};

/**
 * Create DynamicList element
 * @param {Array<HTMLElement | string>} list - Array of items.
 * @param {number} limitItems - Max number of items.
 * @param {number} gap - Margin between items.
 * @param {string} itemWidth - Item width. CSS width property.
 * @param {string} itemHeight - Item height. CSS height property.
 * @param {string} popWidth - Card view width. CSS width property.
 * @param {string} popHeight - Card view height. CSS height property.
 * @returns {HTMLDivElement}
 */
const DynamicList = ({
  list = [],
  limitItems = 100,
  gap = 8,
  itemWidth = '200px',
  itemHeight = '',
  popWidth = '500px',
  popHeight = '360px',
}) => {
  let selectedPosition = null;
  let hoveredPosition = null;
  let originOffsetX = null;
  let originOffsetY = null;

  const root = document.createElement('div');
  const dimedLayer = document.createElement('div');
  const ul = document.createElement('ul');

  ul.className = 'dynamic-list';
  dimedLayer.className = 'dimed-layer hidden';

  root.appendChild(ul);
  root.appendChild(dimedLayer);

  const items = list.slice(0, limitItems).map((item, index) => {
    const li = document.createElement('li');
    li.className = 'dynamic-list-item';
    li.style.width = itemWidth;
    li.style.height = itemHeight;
    li.style.marginTop = `${index > 0 ? gap : 0}px`;

    const listContentWrapper = document.createElement('div');
    listContentWrapper.className = 'list-content-wrapper';

    const listContent = document.createElement('div');
    listContent.className = 'list-content';
    if (item instanceof HTMLElement) {
      listContent.appendChild(item);
    } else {
      listContent.innerText = item;
    }

    listContentWrapper.appendChild(listContent);
    li.appendChild(listContentWrapper);

    return li;
  });

  items.forEach((item) => {
    ul.appendChild(item);
  });

  const applyHoverEffect = (item, enabled) => {
    item.animate(
      {
        transform: enabled
          ? `translate(${SELECT_INDENT}px, 0)`
          : 'translate(0, 0)',
      },
      ANIMATION_OPTION
    );
  };

  const applyNeighborEffect = (item, enabled) => {
    item.animate(
      {
        transform: enabled
          ? `translate(${SELECT_NEIGHBOR_INDENT}px, 0)`
          : 'translate(0, 0)',
      },
      ANIMATION_OPTION
    );
  };

  const applyHoverAndNeighborEffect = (enabled) => {
    applyHoverEffect(items[hoveredPosition], enabled);
    if (hoveredPosition > 0) {
      applyNeighborEffect(items[hoveredPosition - 1], enabled);
    }
    if (hoveredPosition < items.length - 1) {
      applyNeighborEffect(items[hoveredPosition + 1], enabled);
    }
  };

  const handleMouseLeave = (e) => {
    applyHoverAndNeighborEffect(false);
    hoveredPosition = null;

    e.target.removeEventListener('mouseleave', handleMouseLeave);
  };

  const handleMouseOver = (e) => {
    const targetItem = e.target.closest('.dynamic-list-item');
    if (!targetItem) return;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition || hoveredPosition !== null) return;

    hoveredPosition = position;
    applyHoverAndNeighborEffect(true);

    targetItem.addEventListener('mouseleave', handleMouseLeave);
  };

  const handleItemClick = (e) => {
    const targetItem = e.target.closest('.dynamic-list-item');
    if (!targetItem) return;
    const position = items.indexOf(targetItem);
    if (
      position === selectedPosition ||
      targetItem.classList.contains('selected')
    )
      return;

    targetItem.removeEventListener('mouseleave', handleMouseLeave);

    selectedPosition = position;

    // Original position for animation
    const OffsetLeftBeforePopout = targetItem.offsetLeft;
    const OffsetTopBeforePopout = targetItem.offsetTop;
    const [totalScrollLeft, totalScrollTop] = sumParentScrollOffset(targetItem);
    originOffsetX = OffsetLeftBeforePopout - totalScrollLeft;
    originOffsetY = OffsetTopBeforePopout - totalScrollTop;

    const copiedItem = targetItem.cloneNode(true);
    copiedItem.dataset['type'] = 'clone';
    copiedItem.style.transform = `translate(${SELECT_INDENT}px, 0)`;
    ul.insertBefore(copiedItem, targetItem);

    targetItem.classList.add('selected');
    targetItem.style.margin = '0px';
    targetItem.style.zIndex = getMaxZIndex() + 1;
    targetItem.animate(
      [
        {
          left: `${originOffsetX}px`,
          top: `${originOffsetY}px`,
          width: itemWidth,
          height: itemHeight,
        },
        {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: popWidth,
          height: popHeight,
        },
      ],
      ANIMATION_OPTION
    );

    const contentWrapper = targetItem.querySelector('.list-content');
    contentWrapper.animate(
      [
        {
          left: '0px',
          transform: 'translate(0, -50%)',
        },
        {
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      ],
      ANIMATION_OPTION
    );

    dimedLayer.classList.remove('hidden');
    dimedLayer.animate(
      [
        {
          opacity: 0,
        },
        {
          opacity: 1,
        },
      ],
      ANIMATION_OPTION
    );

    disableScroll();
  };

  const handleDimedLayerClick = () => {
    if (selectedPosition === null) return;
    const selectedItem = items[selectedPosition];
    const copiedItem = ul.querySelector('[data-type="clone"]');
    applyHoverEffect(copiedItem, false);

    selectedPosition = null;

    // Restore list view
    setTimeout(() => {
      selectedItem.classList.remove('selected');
      selectedItem.style.margin = '';
      selectedItem.style.marginTop = `${gap}px`;
      selectedItem.style.width = itemWidth;
      selectedItem.style.height = itemHeight;
      selectedItem.style.left = '';
      selectedItem.style.top = '';
      selectedItem.style.transform = '';
      selectedItem.style.zIndex = '';
      copiedItem.remove();
      dimedLayer.classList.add('hidden');
      enableScroll();
    }, ANIMATION_DURATION);

    selectedItem.animate(
      {
        left: `${originOffsetX}px`,
        top: `${originOffsetY}px`,
        transform: 'translate(0, 0)',
        width: itemWidth,
        height: itemHeight,
      },
      ANIMATION_OPTION
    );
    originOffsetX = null;
    originOffsetY = null;

    const contentWrapper = selectedItem.querySelector('.list-content');
    contentWrapper.animate(
      {
        left: '0px',
        transform: 'translate(0, -50%)',
      },
      ANIMATION_OPTION
    );

    dimedLayer.animate(
      {
        opacity: 0,
      },
      ANIMATION_OPTION
    );

    applyHoverAndNeighborEffect(false);
    hoveredPosition = null;
  };

  ul.addEventListener('mouseover', handleMouseOver);
  ul.addEventListener('click', handleItemClick);
  dimedLayer.addEventListener('click', handleDimedLayerClick);

  return root;
};

export default DynamicList;
