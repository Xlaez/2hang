import Joi = require('joi');

export const getUserByID = {
  params: Joi.object().keys({
    user_id: Joi.string().required().trim(),
  }),
};

export const getUserByUsername = {
  params: Joi.object().keys({
    username: Joi.string().required().trim(),
  }),
};

export const sendHangoutRequest = {
  body: Joi.object().keys({
    user_id: Joi.string().required(),
  }),
};

export const acceptHagoutrequest = {
  body: Joi.object().keys({
    request_id: Joi.string().required(),
  }),
};

export const getUserHangouts = {
  query: Joi.object().keys({
    user_id: Joi.string().required().trim(),
    limit: Joi.string().required(),
    page: Joi.string().required(),
  }),
};

export const blockHangout = {
  body: Joi.object().keys({
    user_id: Joi.string().required(),
  }),
};

export const getHangoutRequest = {
  query: Joi.object().keys({
    limit: Joi.string().required(),
    page: Joi.string().required(),
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

export const searchUserByKeyword = {
  query: Joi.object().keys({
    keyword: Joi.string().required().trim(),
    limit: Joi.string().required(),
    page: Joi.string().required(),
  }),
};

export const updateInterests = {
  body: Joi.object().keys({
    interests: Joi.array().required(),
  }),
};

export const areUsersHangouts = {
  query: Joi.object().keys({
    user_id: Joi.string().required().trim(),
  }),
};
