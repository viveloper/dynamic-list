import { sumParentScrollOffset, getMaxZIndex } from './utils.js';

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
    contentWrapper.innerText = 'index123';

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

  const handleMouseEnter = (e) => {
    const targetItem = e.target;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition) return;

    hoveredPosition = position;
    applyHoverEffect(true);

    // 'Should return the position when other item is hovered.'
    console.log('hovered item position:', position);
  };

  const handleMouseLeave = (e) => {
    const targetItem = e.target;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition) return;

    applyHoverEffect(false);
    hoveredPosition = position;
  };

  const handleItemClick = (e) => {
    const targetItem = e.currentTarget;
    const position = items.indexOf(targetItem);
    if (position === selectedPosition) return;

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
  };

  const handleDimedLayerClick = () => {
    const selectedItem = items[selectedPosition];
    const copiedTransparentItem = ul.querySelector('[data-type="clone"]');

    selectedPosition = null;

    // Restore view
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
    }, ANIMATION_DURATION);
    selectedItem.style.justifyContent = 'normal';

    applyHoverEffect(false);

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
  };

  items.forEach((item) => {
    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
    item.addEventListener('click', handleItemClick);
  });

  dimedLayer.addEventListener('click', handleDimedLayerClick);

  return element;
};

export default DynamicList;
