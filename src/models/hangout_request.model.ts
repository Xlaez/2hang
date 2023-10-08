import { mongoose, transformDoc } from '@dolphjs/dolph/packages';
import { hangoutsRequets, users } from './constants';
import paginate = require('mongoose-paginate-v2');
import { IHangRequest } from './interfaces';

const HangRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
  },
  {
    timestamps: true,
    collection: hangoutsRequets,
  },
);

HangRequestSchema.plugin(transformDoc);
HangRequestSchema.plugin(paginate);

export const HangRequestModel: mongoose.PaginateModel<IHangRequest> = mongoose.model<
  IHangRequest,
  mongoose.PaginateModel<IHangRequest>
>(hangoutsRequets, HangRequestSchema);
