import { mongoose, transformDoc } from '@dolphjs/dolph/packages';
import { posts, replies, users } from './constants';
import { LikeSchema } from './schemas';
import paginate = require('mongoose-paginate-v2');
import { IReply } from './interfaces';

const ReplySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: users,
    required: true,
  },
  text: {
    type: String,
    maxlength: 200,
  },
  parent_id: {
    type: mongoose.Types.ObjectId,
    ref: replies,
  },
  post_id: {
    type: mongoose.Types.ObjectId,
    ref: posts,
    required: true,
  },
  nb_children: {
    type: Number,
    default: 0,
  },
  nb_likes: {
    type: Number,
    default: 0,
  },
  likes: [LikeSchema],
  is_child: {
    type: Boolean,
    default: false,
  },
});

ReplySchema.plugin(transformDoc);
ReplySchema.plugin(paginate);

export const ReplyModel: mongoose.PaginateModel<IReply> = mongoose.model<IReply, mongoose.PaginateModel<IReply>>(
  replies,
  ReplySchema,
);
