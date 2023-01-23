console.log('Dynamic List');

const LIST_INDENT = 40;
const LIST_SUB_INDENT = 20;
const ANIMATE_OPTION = {
  duration: 300,
  easing: 'ease',
  fill: 'forwards',
};

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
    li.style.border = '1px solid black';
    li.style.width = itemWidth;
    li.style.height = itemHeight;
    li.style.marginTop = `${index > 0 ? gap : 0}px`;
    li.style.padding = '4px 8px';
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    li.innerText = item;

    return li;
  });

  items.forEach((item) => {
    ul.appendChild(item);
  });

  // TODO: mouseenter <-> mouseover 차이 확인
  const createMouseEnterHandler = (targetIndex, items) => () => {
    items[targetIndex].animate(
      { marginLeft: `${LIST_INDENT}px` },
      ANIMATE_OPTION
    );
    if (targetIndex > 0) {
      items[targetIndex - 1].animate(
        { marginLeft: `${LIST_SUB_INDENT}px` },
        ANIMATE_OPTION
      );
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].animate(
        { marginLeft: `${LIST_SUB_INDENT}px` },
        ANIMATE_OPTION
      );
    }
  };

  // TODO: mouseleave <-> mouseout 차이 확인
  const createMouseLeaveHandler = (targetIndex, items) => () => {
    items[targetIndex].animate({ marginLeft: 0 }, ANIMATE_OPTION);
    if (targetIndex > 0) {
      items[targetIndex - 1].animate({ marginLeft: 0 }, ANIMATE_OPTION);
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].animate({ marginLeft: 0 }, ANIMATE_OPTION);
    }
  };

  const replaceTransparentItem = (item) => {
    const transparentItem = item.cloneNode(true);
    transparentItem.style.opacity = 0;
    ul.insertBefore(transparentItem, item);
  };

  const createItemClickHandler = (item, handleMouseLeave) => {
    const handleItemClick = () => {
      const OffsetLeftBeforePopout = item.offsetLeft;
      const OffsetTopBeforePopout = item.offsetTop;
      const [totalScrollLeft, totalScrollTop] = sumParentScrollOffset(item);

      const startOffsetX = OffsetLeftBeforePopout - totalScrollLeft;
      const startOffsetY = OffsetTopBeforePopout - totalScrollTop;

      replaceTransparentItem(item);

      item.removeEventListener('mouseleave', handleMouseLeave);
      item.removeEventListener('click', handleItemClick);
      item.classList.add('selected');
      item.style.position = 'fixed';
      item.style.margin = '0';
      item.style.left = `${startOffsetX}px`; // original position
      item.style.top = `${startOffsetY}px`; // original position
      item.style.zIndex = 1;
      item.style.backgroundColor = 'white';
      item.style.display = 'flex';
      item.style.justifyContent = 'center';
      item.style.alignItems = 'center';

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
        ANIMATE_OPTION
      );

      dimedLayer.addEventListener('click', () => {
        console.log('clicked dimed layer');
        // TODO:
      });

      // go to final position (pop out)
      item.animate(
        {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: popWidth,
          height: popHeight,
        },
        ANIMATE_OPTION
      );
    };

    return handleItemClick;
  };

  items.forEach((item, index) => {
    const handleMouseEnter = createMouseEnterHandler(index, items);
    const handleMouseLeave = createMouseLeaveHandler(index, items);
    const handleItemClick = createItemClickHandler(item, handleMouseLeave);

    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
    item.addEventListener('click', handleItemClick);
  });

  root.appendChild(ul);
  root.appendChild(dimedLayer);

  return root;
}
