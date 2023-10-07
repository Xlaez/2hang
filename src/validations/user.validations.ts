import Joi = require('joi');

export const getUserByID = {
  params: Joi.object().keys({
    user_id: Joi.string().required().trim(),
  }),
};

export const updateUser = {
  body: Joi.object().keys({
    username: Joi.string().trim().min(2).max(15),
    display_name: Joi.string().min(2).max(20),
    gender: Joi.string(),
    dob: Joi.date(),
    location: Joi.object().keys({
      state: Joi.string(),
      country: Joi.string(),
    }),
    socials: Joi.object().keys({
      twitter: Joi.string(),
      facebook: Joi.string(),
    }),
  }),
};
