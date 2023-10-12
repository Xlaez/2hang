import Joi = require('joi');

export const newReport = {
  body: Joi.object({
    type: Joi.string().required(),
    details: Joi.string().required(),
    reported_id: Joi.string().required(),
  }),
};
