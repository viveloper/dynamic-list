# Dynamic List

Reusable dynamic list component

## Example

```javascript
const dynamicList = DynamicList({
  list: ['1', '2', '3', '4', '5'],
  itemWidth: '200px',
  itemHeight: '40px',
});

const targetEl = document.querySelector('#dynamic-list-area');
targetEl.appendChild(dynamicList);
```

## Usage

### Install Dependencies

```
yarn install
```

### Run

```
yarn start
```
