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
  .map((_, index) => {
    const div = document.createElement('div');
    div.style.width = '200px';
    div.style.height = '36px';
    div.style.backgroundColor = '#C7F9CC';
    div.style.border = '1px solid #70EB8D';
    div.style.padding = '4px 8px';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.innerHTML = index + 1;

    return div;
  });

const targetEl = document.querySelector('#dynamic-list-area');
const dynamicList = DynamicList({
  items: SAMPLE_DATA,
  gap: 8,
  minWidth: '260px',
  maxHeight: '1600px',
});
targetEl.appendChild(dynamicList);

// Dynamic List Component
// TODO: 설명
// TODO: props를 변경할때마다 DOM을 새로 생성하고있다. DOM을 유지하고 state에 따라 업데이트되는 방식으로 수정 해보자.
function DynamicList({
  items,
  gap,
  minWidth,
  maxHeight,
  popWidth = '500px',
  popHeight = '360px',
}) {
  const root = document.createElement('div');

  const dimedLayer = document.createElement('div');
  dimedLayer.className = 'dimed-layer hidden';

  const ul = document.createElement('ul');
  ul.className = 'dynamic-list';
  ul.style.minWidth = minWidth;
  ul.style.maxHeight = maxHeight;
  ul.style.overflow = 'auto';

  const wrappedItems = items.map((item, index) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.style.width = 'fit-content'; // TODO: 애니메이션 적용을 위해 수치값으로 적용 필요
    li.style.height = 'fit-content'; // TODO: 애니메이션 적용을 위해 수치값으로 적용 필요
    li.style.marginTop = `${index > 0 ? gap : 0}px`;
    if (typeof item === 'object') {
      li.appendChild(item);
    } else {
      // TODO: 일반 텍스트 처리
      li.innerText = item;
    }

    return li;
  });

  wrappedItems.forEach((item) => {
    ul.appendChild(item);
  });

  // TODO: mouseenter <-> mouseover 차이 확인
  const createMouseEnterHandler = (targetIndex, items) => () => {
    // items[targetIndex].classList.add('hover-item');
    // if (targetIndex > 0) {
    //   items[targetIndex - 1].classList.add('neighbor-item');
    // }
    // if (targetIndex < items.length - 1) {
    //   items[targetIndex + 1].classList.add('neighbor-item');
    // }

    items[targetIndex].animate(
      { marginLeft: '40px' },
      {
        duration: 300,
        easing: 'ease',
        fill: 'forwards',
      }
    );
    if (targetIndex > 0) {
      items[targetIndex - 1].animate(
        { marginLeft: '20px' },
        {
          duration: 300,
          easing: 'ease',
          fill: 'forwards',
        }
      );
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].animate(
        { marginLeft: '20px' },
        {
          duration: 300,
          easing: 'ease',
          fill: 'forwards',
        }
      );
    }
  };

  // TODO: mouseleave <-> mouseout 차이 확인
  const createMouseLeaveHandler = (targetIndex, items) => () => {
    // items[targetIndex].classList.remove('hover-item');
    // if (targetIndex > 0) {
    //   items[targetIndex - 1].classList.remove('neighbor-item');
    // }
    // if (targetIndex < items.length - 1) {
    //   items[targetIndex + 1].classList.remove('neighbor-item');
    // }

    items[targetIndex].animate(
      { marginLeft: '0px' },
      {
        duration: 300,
        easing: 'ease',
        fill: 'forwards',
      }
    );
    if (targetIndex > 0) {
      items[targetIndex - 1].animate(
        { marginLeft: '0px' },
        {
          duration: 300,
          easing: 'ease',
          fill: 'forwards',
        }
      );
    }
    if (targetIndex < items.length - 1) {
      items[targetIndex + 1].animate(
        { marginLeft: '0px' },
        {
          duration: 300,
          easing: 'ease',
          fill: 'forwards',
        }
      );
    }
  };

  const replaceTransparentItem = (item) => {
    const transparentItem = document.createElement('li');
    transparentItem.className = item.className;
    transparentItem.style.width = item.style.width;
    transparentItem.style.marginTop = item.style.marginTop;
    transparentItem.innerHTML = item.innerHTML;
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

      // start position
      item.style.left = `${startOffsetX}px`;
      item.style.top = `${startOffsetY}px`;

      // final position
      // item.style.left = '50%';
      // item.style.top = '50%';
      // item.style.transform = 'translate(-50%, -50%)';

      item.style.zIndex = 1;
      // item.style.width = popWidth;
      // item.style.height = popHeight;
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
        {
          duration: 300,
          easing: 'ease',
          fill: 'forwards',
        }
      );

      dimedLayer.addEventListener('click', () => {
        console.log('clicked dimed layer');
      });

      // start -> final moving animation
      item.animate(
        [
          // from keyframe
          {
            left: `${startOffsetX}px`,
            top: `${startOffsetY}px`,
            width: '0px', // TODO: 애니메이션 적용을 위해 수치값으로 적용 필요
            height: '0px', // TODO: 애니메이션 적용을 위해 수치값으로 적용 필요
            opacity: 0,
          },
          // to keyframe
          {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: popWidth,
            height: popHeight,
            opacity: 1,
          },
        ],
        {
          duration: 300, // TODO: 통일이 필요한 값들은 상수화
          easing: 'ease',
          fill: 'forwards',
        }
      );
    };

    return handleItemClick;
  };

  wrappedItems.forEach((item, index) => {
    const handleMouseEnter = createMouseEnterHandler(index, wrappedItems);
    const handleMouseLeave = createMouseLeaveHandler(index, wrappedItems);
    const handleItemClick = createItemClickHandler(item, handleMouseLeave);

    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
    item.addEventListener('click', handleItemClick);
  });

  root.appendChild(ul);
  root.appendChild(dimedLayer);

  return root;
}
