/**
 * Given an angle in radians, this function normalizes the angle to the range
 * 0 to 2 PI and returns the normalized angle.
 * @param {number} angle Angle from -pi to pi or outside
 * @return {number} angle from -pi to pi
 */
 const normalizeAngle = angle => {
    return angle - (2 * Math.PI) * Math.floor((angle + Math.PI) / (2 * Math.PI));
  }
  
  /**
   * Given a value, a minimum, and a maximum, returns true if value is
   * between the minimum and maximum, inclusive of both bounds. This
   * functio will still work if min and max are switched.
   * @param {number} val The value to check.
   * @param {number} min The minimum bound.
   * @param {number} max The maximum bound.
   * @return {boolean}
   */
  const inBound = (val, min, max) => {
    if (min > max) {
      return val >= max && val <= min
    }
    return val >= min && val <= max
  }

  /**
 * Bounds a number to the given minimum and maximum, inclusive of both
 * bounds. This function will still work if min and max are switched.
 * @param {number} val The value to check.
 * @param {number} min The minimum number to bound to.
 * @param {number} max The maximum number to bound to.
 * @return {number}
 */
const bound = (val, min, max) => {
  if (min > max) {
    return Math.min(Math.max(val, max), min)
  }
  return Math.min(Math.max(val, min), max)
}

 /**
   * Returns bounds if entity is within bounds.
   * @param {number} val The value to check.
   * @param {number} min The minimum number to bound to.
   * @param {number} max The maximum number to bound to.
   * @return {number}
   */
  const reverseBound = (val, pval, min, max) => {
    if (pval <= min && val > min) { //pval < min &&
      return min ;
    }
    if (pval >= max && val  < max ) { // pval > max && 
      return max;
    }

    return val;
  }

  /**
   * Returns boolean if entity is within bounds.
   * @param {number} val The value to check.
   * @param {number} min The minimum number to bound to.
   * @param {number} max The maximum number to bound to.
   * @return {boolean}
   */
  const reverseBounce = (val, pval, min, max) => {
    if (pval < min && val > min) {
      return true;
    }
    if (pval > max && val < max) {
      return true;
    }

    return false;
  }
  
  /**
   * Returns a random floating-point number between the given min and max
   * values, exclusive of the max value.
   * @param {number} min The minimum number to generate.
   * @param {number} max The maximum number to generate.
   * @return {number}
   */
  const randRange = (min, max) => {
    if (min >= max) {
      return Math.random() * (min - max) + max
    }
    return Math.random() * (max - min) + min
  }
  
  /**
   * Returns a random integer between the given min and max values, exclusive
   * of the max value.
   * @param {number} min The minimum number to generate.
   * @param {number} max The maximum number to generate.
   * @return {number}
   */
  const randRangeInt = (min, max) => {
    if (min > max) {
      return Math.floor(Math.random() * (min - max)) + max
    }
    return Math.floor(Math.random() * (max - min)) + min
  }
  
  /**
   * Returns a random element in a given array.
   * @param {Array.<Object>} array The array from which to select a random
   *   element from.
   * @return {Object}
   */
  const choiceArray = array => {
    return array[randRangeInt(0, array.length)]
  }

  /**
   * Return the sum of an array.
   * @param {Array.<number>} array 
   * @returns {number}
   */
  const sum = array => {
    total = 0;
    array.forEach(item => total += item);

    return total;
  }

  /**
   * Returns the max index of an array.
   * @param {Array.<number>} array 
   * @returns {number}
   */
  const argmax = array => {
    index = 0;
    max = -Infinity
    for (var i = 0; i < array.length; i++) {
      if (array[i] > max) {
        max = array[i];
        index = i;
      }
    }

    return index;
  }

  /**
   * Get the maximum value in an array
   * @param {Array} array 
   * @returns 
   */
  const maxValue = array => {
    max = -Infinity
    for (var i = 0; i < array.length; i++) {
      if (array[i] > max) {
        max = array[i];
      }
    }

    return max;
  }

  const generateRandomString = length => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  module.exports = {
    normalizeAngle,
    inBound,
    bound,
    reverseBound,
    reverseBounce,
    randRange,
    randRangeInt,
    choiceArray,
    sum,
    argmax,
    maxValue,
    generateRandomString
  }