import Joi = require('joi');

export const newPost = {
  body: Joi.object().keys({
    content: Joi.string().required().min(300),
    tags: Joi.array(),
    public: Joi.boolean(),
    type: Joi.string().required(),
  }),
};
