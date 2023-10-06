import Joi = require('joi');
import { passwordValidatorUtil } from './utils';

export const newUser = {
  body: Joi.object().keys({
    username: Joi.string().required().trim().min(2).max(15),
    display_name: Joi.string().required().min(2).max(20),
    device_id: Joi.string(),
    gender: Joi.string().required(),
    password: Joi.string().required().custom(passwordValidatorUtil).trim(),
    dob: Joi.date().required(),
  }),
};

export const sendOtp = {
  body: Joi.object().keys({
    otp: Joi.string().required().min(5).max(5).trim(),
  }),
};

export const verifyEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().trim().email(),
  }),
};

export const login = {
  body: Joi.object().keys({
    device_id: Joi.string(),
    username: Joi.string().required().trim(),
    password: Joi.string().required().trim().custom(passwordValidatorUtil),
  }),
};
