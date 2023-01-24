import DynamicList from './src/DynamicList.js';

// test data
const SAMPLE_DATA = Array(100)
  .fill('')
  .map((_, index) => `${index + 1}`);

// run app
const dynamicList = DynamicList({
  list: SAMPLE_DATA,
  gap: 8,
  itemWidth: '200px',
  itemHeight: '40px',
  popWidth: '500px',
  popHeight: '360px',
});

const targetEl = document.querySelector('#dynamic-list-area');
targetEl.appendChild(dynamicList);
