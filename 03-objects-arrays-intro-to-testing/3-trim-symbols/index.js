/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size == null) {
    return string;
  }
  let lastSymbol = '';
  let count = 0;
  let result = '';
  for (const c of string) {
    count = lastSymbol === c ? count + 1 : 1;
    if (count <= size) {
      result = result + c;
    }
    lastSymbol = c;
  }
  return result;
}
