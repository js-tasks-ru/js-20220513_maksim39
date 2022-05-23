/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrCopy = [...arr];
  if (param === 'asc') {
    return arrCopy.sort((a, b) => compare(a, b));
  } else {
    return arrCopy.sort((a, b) => compare(b, a));
  }

  function compare(a, b) {
    const comparison = a.toLowerCase().localeCompare(b.toLowerCase());
    if (comparison === 0) {
      return a > b ? 1 : (a === b) ? 0 : -1;
    }
    return comparison;
  }
}
