import Joi = require('joi');
import { passwordValidatorUtil } from './utils';

export const newSuperAdmin = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(passwordValidatorUtil),
    email: Joi.string().required().email(),
    username: Joi.string().required().max(10),
    display_name: Joi.string().required(),
  }),
};

export const activateSuperAdminAccount = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().required().min(5),
    device_id: Joi.string(),
  }),
};
