import { mongoose } from '@dolphjs/dolph/packages';
import { posts, users } from './constants';
import { transformDoc } from '@dolphjs/dolph/packages';
import paginate = require('mongoose-paginate-v2');

import { IPost } from './interfaces';
import { LikeSchema } from './schemas';

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      maxlength: 250,
      required: true,
    },
    tags: [{ type: String }],
    public: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: users,
      required: true,
    },
    type: {
      type: String,
      enum: ['idea', 'problem', 'solution', 'opinion', 'random', 'thought'],
    },
    nb_replies: {
      type: Number,
      default: 0,
    },
    nb_likes: {
      type: Number,
      default: 0,
    },
    likes: [LikeSchema],
  },
  {
    timestamps: true,
  },
);

PostSchema.plugin(transformDoc);
PostSchema.plugin(paginate);

export const PostModel: mongoose.PaginateModel<IPost> = mongoose.model<IPost, mongoose.PaginateModel<IPost>>(
  posts,
  PostSchema,
);

// V2 - add mood
