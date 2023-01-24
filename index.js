console.log('Dynamic List');

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
