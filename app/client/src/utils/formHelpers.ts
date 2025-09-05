/**
 * Transforms empty strings to null for option fields in form data
 * This is useful when working with Effect Schema optional fields that expect null instead of empty strings
 */
export const rhfEmptyStringToNull = (value: any) => {
  return value === '' ? null : value;
};