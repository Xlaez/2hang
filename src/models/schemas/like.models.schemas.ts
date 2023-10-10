import { mongoose } from '@dolphjs/dolph/packages';

export const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId },
  },
  { timestamps: false, _id: false },
);
