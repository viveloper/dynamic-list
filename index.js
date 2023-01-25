import DynamicList from './src/DynamicList.js';

// test data
const SAMPLE_DATA = Array(200)
  .fill('')
  .map((_, index) => `${index + 1}`);

// run app
const dynamicList = DynamicList({
  list: SAMPLE_DATA,
  itemWidth: '200px',
  itemHeight: '40px',
});

const targetEl = document.querySelector('#dynamic-list-area');
targetEl.appendChild(dynamicList);
