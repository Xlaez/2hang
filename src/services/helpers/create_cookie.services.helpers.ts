import { configs } from '@/src/configs';
import { generateJWTwithHMAC } from '@dolphjs/dolph/utilities';
import moment = require('moment');
import { Types } from 'mongoose';

export const generateToken = async (id: Types.ObjectId | string) => {
  return generateJWTwithHMAC({
    payload: {
      exp: moment().add(configs.jwt.expires, 'seconds').unix(),
      iat: moment().unix(),
      sub: id,
    },
    secret: configs.jwt.secret,
  });
};

export const createAuthCookie = async (id: Types.ObjectId | string) => {
  const token = generateToken(id);
  const options = {
    expires: new Date(Date.now() + 1000 * 60 * 30),
    httpOnly: false,
    secure: false,
  };

  if (configs.env === 'production') {
    options.secure = true;
    options.httpOnly = true;
  }

  return {
    token,
    options,
  };
};

export const destroyCookie = async () => {
  const options = {
    expires: new Date(0),
    httpOnly: true,
    secure: false,
  };

  return { options };
};
