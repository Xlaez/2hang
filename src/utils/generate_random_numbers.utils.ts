import { randomBytes } from 'crypto';

export const generateRandomNumbers = (min: number, max: number, len: number) => {
  let result = '';
  for (let i = 0; i < len; i++) {
    const tempNum = (randomBytes(4).readUint32BE() / 0xffffffff) * (max - min + 1) + min;

    result += Math.floor(tempNum % 10).toString();
  }

  return result;
};
