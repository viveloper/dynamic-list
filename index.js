console.log('Dynamic List');

// utility function
const sumParentScrollOffset = (el) => {
  if (!el) return [0, 0];
  const [scrollLeft, scrollTop] = sumParentScrollOffset(el.parentElement);
  return [(el.scrollLeft ?? 0) + scrollLeft, (el.scrollTop ?? 0) + scrollTop];
};

// test data
const SAMPLE_DATA = Array(100)
  .fill('')
  .map((_, index) => `${index + 1}`);

// run app
const targetEl = document.querySelector('#dynamic-list-area');
const dynamicList = DynamicList({
  list: SAMPLE_DATA,
  gap: 8,
  itemWidth: '200px',
  itemHeight: '36px',
  popWidth: '500px',
  popHeight: '360px',
});
targetEl.appendChild(dynamicList);

// Dynamic List Component
// TODO: 설명
// TODO: props를 변경할때마다 DOM을 새로 생성하고있다. DOM을 유지하고 state에 따라 업데이트되는 방식으로 수정 해보자.
function DynamicList({
  list = [],
  gap = 8,
  itemWidth = '200px',
  itemHeight,
  popWidth = '500px',
  popHeight = '360px',
}) {
  const root = document.createElement('div');

  const dimedLayer = document.createElement('div');
  dimedLayer.className = 'dimed-layer hidden';

  const ul = document.createElement('ul');
  ul.className = 'dynamic-list';

  const items = list.map((item, index) => {
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

  // TODO: mouseenter <-> mouseover 차이 확인
  const createMouseEnterHandler = (targetIndex, items) => () => {
    items[targetIndex].classList.add('hover-item');
    if (targetIndex > 0) {
      items[targetIndex - 1].classList.add('neighbor-item');
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].classList.add('neighbor-item');
    }
  };

  // TODO: mouseleave <-> mouseout 차이 확인
  const createMouseLeaveHandler = (targetIndex, items) => () => {
    items[targetIndex].classList.remove('hover-item');
    if (targetIndex > 0) {
      items[targetIndex - 1].classList.remove('neighbor-item');
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].classList.remove('neighbor-item');
    }
  };

  const cloneTransparentItem = (item) => {
    const transparentItem = item.cloneNode(true);
    transparentItem.style.opacity = 0;
    return transparentItem;
  };

  const createDimedLayerClickHandler = ({
    item,
    startOffsetX,
    startOffsetY,
    mouseLeaveHandler,
    itemClickHandler,
    copiedTransparentItem,
  }) => {
    const handleDimedLayerClick = () => {
      console.log('clicked dimed layer');

      // TODO: rollback item
      item.addEventListener('mouseleave', mouseLeaveHandler);
      item.addEventListener('click', itemClickHandler);

      item.classList.remove('selected');
      item.style.margin = '';
      item.style.marginTop = '8px';
      item.style.width = itemWidth;
      item.style.height = itemHeight;

      // original position
      item.style.left = '';
      item.style.top = '';
      item.style.transform = '';

      copiedTransparentItem.remove();

      dimedLayer.classList.add('hidden');
      dimedLayer.removeEventListener('click', handleDimedLayerClick);

      mouseLeaveHandler();
    };
    return handleDimedLayerClick;
  };

  const createItemClickHandler = ({ item, mouseLeaveHandler }) => {
    const handleItemClick = () => {
      const OffsetLeftBeforePopout = item.offsetLeft;
      const OffsetTopBeforePopout = item.offsetTop;
      const [totalScrollLeft, totalScrollTop] = sumParentScrollOffset(item);

      const startOffsetX = OffsetLeftBeforePopout - totalScrollLeft;
      const startOffsetY = OffsetTopBeforePopout - totalScrollTop;

      const copiedTransparentItem = cloneTransparentItem(item);
      ul.insertBefore(copiedTransparentItem, item);

      item.removeEventListener('mouseleave', mouseLeaveHandler);
      item.removeEventListener('click', handleItemClick);
      item.classList.add('selected');
      item.style.margin = '0px';
      item.style.width = popWidth;
      item.style.height = popHeight;

      // final position
      item.style.left = '50%';
      item.style.top = '50%';
      item.style.transform = 'translate(-50%, -50%)';

      dimedLayer.classList.remove('hidden');
      dimedLayer.addEventListener(
        'click',
        createDimedLayerClickHandler({
          item,
          startOffsetX,
          startOffsetY,
          mouseLeaveHandler,
          itemClickHandler: handleItemClick,
          copiedTransparentItem,
        })
      );
    };

    return handleItemClick;
  };

  items.forEach((item, index) => {
    const handleMouseEnter = createMouseEnterHandler(index, items);
    const handleMouseLeave = createMouseLeaveHandler(index, items);
    const handleItemClick = createItemClickHandler({
      item,
      mouseLeaveHandler: handleMouseLeave,
    });

    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
    item.addEventListener('click', handleItemClick);
  });

  root.appendChild(ul);
  root.appendChild(dimedLayer);

  return root;
}
