const queryList = new Array();
setInterval(() => {
  const queryListDelete = new Array();
  queryList.forEach((query) => {
    if (query.all) {
      let element = document.querySelectorAll(query.query);
      if (element.length > 0) {
        queryListDelete.push(query);
        query.callback([...element]);
      }
    } else {
      let element = document.querySelector(query.query);
      if (element) {
        queryListDelete.push(query);
        query.callback(element);
      }
    }
  });
  queryListDelete.forEach((query) => {
    queryList.splice(queryList.indexOf(query), 1);
  });
}, 10);
const asyncQuerySelector = (query) => {
  let element = document.querySelector(query);
  if (element) {
    return element;
  }
  return new Promise((callback) => {
    queryList.push({
      all: false,
      query,
      callback,
    });
  });
};
const asyncQuerySelectorAll = (query) => {
  let element = [...document.querySelectorAll(query)];
  if (element.length > 0) {
    return element;
  }
  return new Promise((callback) => {
    queryList.push({
      all: true,
      query,
      callback,
    });
  });
};

export { asyncQuerySelector, asyncQuerySelectorAll };