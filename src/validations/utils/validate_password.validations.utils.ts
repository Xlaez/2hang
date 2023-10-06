export const passwordValidatorUtil = (value: any, helpers: any) => {
  if (value.length < 6) {
    return helpers.message('password must be at least 6 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};
