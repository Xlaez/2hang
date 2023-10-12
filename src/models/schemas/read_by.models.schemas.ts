import { mongoose } from '@dolphjs/dolph/packages';
import { users } from '../constants';

export const ReadBySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: false,
    _id: false,
  },
);
