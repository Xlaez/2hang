import { compareWithBcryptHash } from '@dolphjs/dolph/utilities';

const hasStringExpired = (expiration: Date) => {
  const currentDate = Date.now();
  const dateFromString = new Date(expiration).getTime();
  if (currentDate <= dateFromString) return false;
  return true;
};

export const compareAndValidateStrings = async (pureString: string, hashString: string, expiration: Date) => {
  const doesStringMatch = compareWithBcryptHash({ pureString, hashString });
  if (doesStringMatch && !hasStringExpired(expiration)) return true;
  return false;
};
