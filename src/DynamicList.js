import {
  sumParentScrollOffset,
  getMaxZIndex,
  disableScroll,
  enableScroll,
} from './utils.js';

const SELECT_INDENT = 40;
const SELECT_NEIGHBOR_INDENT = 20;
const ANIMATION_DURATION = 300;
const ANIMATION_OPTION = {
  duration: ANIMATION_DURATION,
  easing: 'ease',
  fill: 'forwards',
};

const DynamicList = ({
  list = [],
  gap = 8,
  itemWidth = '200px',
  itemHeight = '',
  popWidth = '500px',
  popHeight = '360px',
  maxItemsNumber = 100,
}) => {
  let selectedPosition = null;
  let hoveredPosition = null;
  let originOffsetX = null;
  let originOffsetY = null;

  const element = document.createElement('div');
  const dimedLayer = document.createElement('div');
  const ul = document.createElement('ul');

  ul.className = 'dynamic-list';
  dimedLayer.className = 'dimed-layer hidden';

  element.appendChild(ul);
  element.appendChild(dimedLayer);

  const items = list.slice(0, maxItemsNumber).map((item, index) => {
    const li = document.createElement('li');
    li.className = 'dynamic-list-item';
    li.style.width = itemWidth;
    li.style.height = itemHeight;
    li.style.marginTop = `${index > 0 ? gap : 0}px`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    contentWrapper.innerText = `${index}-content`;

    li.appendChild(contentWrapper);

    return li;
  });

  items.forEach((item) => {
    ul.appendChild(item);
  });

  const applyHoverEffect = (enabled) => {
    items[hoveredPosition].animate(
      {
        transform: enabled
          ? `translate(${SELECT_INDENT}px, 0)`
          : 'translate(0, 0)',
      },
      ANIMATION_OPTION
    );
    if (hoveredPosition > 0) {
      items[hoveredPosition - 1].animate(
        {
          transform: enabled
            ? `translate(${SELECT_NEIGHBOR_INDENT}px, 0)`
            : 'translate(0, 0)',
        },
        ANIMATION_OPTION
      );
    }
    if (hoveredPosition < items.length - 1) {
      items[hoveredPosition + 1].animate(
        {
          transform: enabled
            ? `translate(${SELECT_NEIGHBOR_INDENT}px, 0)`
            : 'translate(0, 0)',
        },
        ANIMATION_OPTION
      );
    }
  };

  const handleMouseLeave = (e) => {
    applyHoverEffect(false);
    hoveredPosition = null;

    e.target.removeEventListener('mouseleave', handleMouseLeave);
  };

  const handleMouseOver = (e) => {
    const targetItem = e.target.closest('.dynamic-list-item');
    if (!targetItem) return;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition || hoveredPosition !== null) return;

    hoveredPosition = position;
    applyHoverEffect(true);

    targetItem.addEventListener('mouseleave', handleMouseLeave);

    // 'Should return the position when other item is hovered.'
    console.log('hovered item position:', position);
  };

  const handleItemClick = (e) => {
    const targetItem = e.target.closest('.dynamic-list-item');
    if (!targetItem) return;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition) return;

    targetItem.removeEventListener('mouseleave', handleMouseLeave);

    selectedPosition = position;

    // original position for animation
    const OffsetLeftBeforePopout = targetItem.offsetLeft;
    const OffsetTopBeforePopout = targetItem.offsetTop;
    const [totalScrollLeft, totalScrollTop] = sumParentScrollOffset(targetItem);
    originOffsetX = OffsetLeftBeforePopout - totalScrollLeft;
    originOffsetY = OffsetTopBeforePopout - totalScrollTop;

    const copiedTransparentItem = targetItem.cloneNode(true);
    copiedTransparentItem.dataset['type'] = 'clone';
    copiedTransparentItem.style.opacity = 0;
    ul.insertBefore(copiedTransparentItem, targetItem);

    targetItem.classList.add('selected');
    targetItem.style.margin = '0px';
    targetItem.style.justifyContent = 'center';
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
    const selectedItem = items[selectedPosition];
    const copiedTransparentItem = ul.querySelector('[data-type="clone"]');

    selectedPosition = null;

    // Restore list view
    setTimeout(() => {
      selectedItem.classList.remove('selected');
      selectedItem.style.margin = '';
      selectedItem.style.marginTop = '8px';
      selectedItem.style.width = itemWidth;
      selectedItem.style.height = itemHeight;
      selectedItem.style.left = '';
      selectedItem.style.top = '';
      selectedItem.style.transform = '';
      selectedItem.style.zIndex = '';
      copiedTransparentItem.remove();
      dimedLayer.classList.add('hidden');
      enableScroll();
    }, ANIMATION_DURATION);
    selectedItem.style.justifyContent = 'normal';

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

    dimedLayer.animate(
      {
        opacity: 0,
      },
      ANIMATION_OPTION
    );

    applyHoverEffect(false);
    hoveredPosition = null;
  };

  ul.addEventListener('mouseover', handleMouseOver);
  ul.addEventListener('click', handleItemClick);
  dimedLayer.addEventListener('click', handleDimedLayerClick);

  return element;
};

export default DynamicList;
