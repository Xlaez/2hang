import Joi = require('joi');

export const newMessage = {
  params: Joi.object().keys({
    text: Joi.string().min(1).max(200),
    hangout_id: Joi.string().required(),
  }),
};
