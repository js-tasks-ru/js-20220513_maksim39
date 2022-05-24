/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(obj).map(function (current) {
    return [current[1], current[0]];
  }));
}
