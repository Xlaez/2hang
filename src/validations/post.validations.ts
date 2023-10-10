import Joi = require('joi');

export const newPost = {
  body: Joi.object().keys({
    content: Joi.string().required().min(300),
    tags: Joi.array(),
    public: Joi.boolean(),
    type: Joi.string().required(),
  }),
};

export const editPost = {
  body: Joi.object().keys({
    content: Joi.string().min(300),
    public: Joi.boolean(),
    post_id: Joi.string().required(),
  }),
};

export const deletePost = {
  params: Joi.object().keys({
    post_id: Joi.string().required(),
  }),
};

export const queryPostsByType = {
  params: Joi.object().keys({
    limit: Joi.string().required(),
    page: Joi.string().required(),
    type: Joi.string().required(),
  }),
};

export const getReplies = {
  params: Joi.object().keys({
    limit: Joi.string().required(),
    page: Joi.string().required(),
    post_id: Joi.string().required(),
    order_by: Joi.string(),
    sorted_by: Joi.string(),
  }),
};

export const getResponds = {
  params: Joi.object().keys({
    limit: Joi.string().required(),
    page: Joi.string().required(),
    post_id: Joi.string().required(),
    parent_id: Joi.string().required(),
  }),
};

export const addReply = {
  body: Joi.object().keys({
    post_id: Joi.string().required(),
    text: Joi.string().required(),
    parent_id: Joi.string(),
  }),
};
