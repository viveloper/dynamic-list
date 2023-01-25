import { sumParentScrollOffset, getMaxZIndex } from './utils.js';

// TODO: animation 적용
// TODO: README.md 작성
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

  const element = document.createElement('div');

  const dimedLayer = document.createElement('div');
  dimedLayer.className = 'dimed-layer hidden';

  const ul = document.createElement('ul');
  ul.className = 'dynamic-list';

  element.appendChild(ul);
  element.appendChild(dimedLayer);

  const items = list.slice(0, maxItemsNumber).map((item, index) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.style.width = itemWidth;
    li.style.height = itemHeight;
    li.style.marginTop = `${index > 0 ? gap : 0}px`;
    li.innerText = item;

    return li;
  });

  items.forEach((item) => {
    ul.appendChild(item);
  });

  const isListItem = (element) => element.classList.contains('item');

  const applyHoverEffect = (enabled) => {
    const targetItem = items[hoveredPosition];
    const method = enabled ? 'add' : 'remove';

    targetItem.classList[method]('hover-item');
    if (hoveredPosition > 0) {
      items[hoveredPosition - 1].classList[method]('neighbor-item');
    }
    if (hoveredPosition < items.length - 1) {
      items[hoveredPosition + 1].classList[method]('neighbor-item');
    }

    if (!enabled) {
      hoveredPosition = null;
    }
  };

  const handleMouseOver = (e) => {
    const targetItem = e.target;
    const position = items.indexOf(targetItem);
    if (!isListItem(targetItem) || position === selectedPosition) return;

    hoveredPosition = position;
    applyHoverEffect(true);

    // 'Should return the position when other item is hovered.'
    console.log('hovered item position:', position);
  };

  const handleMouseOut = (e) => {
    const targetItem = e.target;
    const position = items.indexOf(targetItem);
    if (!isListItem(targetItem) || position === selectedPosition) return;

    applyHoverEffect(false);
  };

  const handleItemClick = (e) => {
    const targetItem = e.target;
    const position = items.indexOf(targetItem);
    if (!isListItem(targetItem) || position === selectedPosition) return;

    selectedPosition = position;

    // // original position for animation
    // const OffsetLeftBeforePopout = targetItem.offsetLeft;
    // const OffsetTopBeforePopout = targetItem.offsetTop;
    // const [totalScrollLeft, totalScrollTop] = sumParentScrollOffset(targetItem);
    // const originOffsetX = OffsetLeftBeforePopout - totalScrollLeft;
    // const originOffsetY = OffsetTopBeforePopout - totalScrollTop;
    // targetItem.style.left = `${originOffsetX}px`;
    // targetItem.style.top = `${originOffsetY}px`;

    const copiedTransparentItem = targetItem.cloneNode(true);
    copiedTransparentItem.dataset['type'] = 'clone';
    copiedTransparentItem.style.opacity = 0;
    ul.insertBefore(copiedTransparentItem, targetItem);

    targetItem.classList.add('selected');
    targetItem.style.margin = '0px';
    targetItem.style.width = popWidth;
    targetItem.style.height = popHeight;
    targetItem.style.zIndex = getMaxZIndex() + 1;

    // final position
    targetItem.style.left = '50%';
    targetItem.style.top = '50%';
    targetItem.style.transform = 'translate(-50%, -50%)';

    dimedLayer.classList.remove('hidden');
  };

  const handleDimedLayerClick = () => {
    const selectedItem = items[selectedPosition];
    const copiedTransparentItem = ul.querySelector('[data-type="clone"]');

    selectedPosition = null;

    // rollback item
    selectedItem.classList.remove('selected');
    selectedItem.style.margin = '';
    selectedItem.style.marginTop = '8px';
    selectedItem.style.width = itemWidth;
    selectedItem.style.height = itemHeight;
    selectedItem.style.left = '';
    selectedItem.style.top = '';
    selectedItem.style.transform = '';
    selectedItem.style.zIndex = 0;

    copiedTransparentItem.remove();

    dimedLayer.classList.add('hidden');

    applyHoverEffect(false);
  };

  ul.addEventListener('mouseover', handleMouseOver);
  ul.addEventListener('mouseout', handleMouseOut);
  ul.addEventListener('click', handleItemClick);
  dimedLayer.addEventListener('click', handleDimedLayerClick);

  return element;
};

export default DynamicList;
