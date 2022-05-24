/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const props = path.split('.');
  return function get (obj, index = 0) {
    const newObj = obj[props[index]];
    if (newObj === undefined) {
      return undefined;
    }
    if (index === props.length - 1) {
      return newObj;
    }
    return get(newObj, index + 1);
  };
}
