import DynamicList from './src/components/DynamicList.js';

const SAMPLE_DATA = Array(100)
  .fill('')
  .map((_, index) => `${index + 1}-content`);

// Run
const dynamicList = DynamicList({
  list: SAMPLE_DATA,
  itemWidth: '200px',
  itemHeight: '40px',
});

const targetEl = document.querySelector('#dynamic-list-area');
targetEl.appendChild(dynamicList);
