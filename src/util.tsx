/**
 *
 * @param value - the value being checked for validity, should be string or boolean
 * @param type - the valid type for the value being checked
 *
 * @returns true if the inputted value is not undefined and is of the type `type`
 */
function validData(value: string | boolean, type: string): boolean {
  return value !== undefined && typeof value === type;
}

export {validData};
