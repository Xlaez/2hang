import { ErrorException } from '@dolphjs/dolph/common';
import { config } from 'dotenv';
import Joi = require('joi');
config({});

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().description('current app environemt').default('development'),
    CLOUDINARY_NAME: Joi.string().required().description('the name of cloudinary folder'),
    CLOUDINARY_API_KEY: Joi.string().required().description('cloudinary api key'),
    CLOUDINARY_SECRET_KEY: Joi.string().required().description('cloudinary secret key'),
    JWT_SECRET: Joi.string().default('2hang-JWT-2hang-SECRET').description('JWT secret key'),
    JWT_ACCESS_EXPIRATION: Joi.number().default(10000).description('seconds after which access tokens expire'),
    SMTP_PASSWORD: Joi.string().required().description('application smtp password'),
    SMTP_USERNAME: Joi.string().description('applications smtp gmail').required(),
    OTP_EXPIRATION: Joi.string().description('otp expiration').default(3600),
  })
  .unknown();

const { value: envVars, error } = envSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) throw new ErrorException(500, `Configs Load error: ${error.message}`);

export const configs = {
  env: envVars.NODE_ENV,
  cloudinary: {
    name: envVars.CLOUDINARY_NAME,
    api_key: envVars.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY_SECRET_KEY,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expires: envVars.JWT_ACCESS_EXPIRATION,
  },
  smtp: {
    user: envVars.SMTP_USERNAME,
    pass: envVars.SMTP_PASSWORD,
  },
  otp: {
    expires: envVars.OTP_EXPIRATION,
  },
};
