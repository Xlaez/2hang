import { mongoose, transformDoc } from '@dolphjs/dolph/packages';
import { hangouts, users } from './constants';
import paginate = require('mongoose-paginate-v2');

import { IHangout } from './interfaces';

const HangoutSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Types.ObjectId, ref: users }],
    blocked_ids: [{ type: mongoose.Types.ObjectId, ref: users }],
  },
  { timestamps: true, collection: hangouts },
);

HangoutSchema.plugin(transformDoc);
HangoutSchema.plugin(paginate);

export const HangoutModel: mongoose.PaginateModel<IHangout> = mongoose.model<IHangout, mongoose.PaginateModel<IHangout>>(
  hangouts,
  HangoutSchema,
);
