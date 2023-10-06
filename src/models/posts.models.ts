import { Schema, model } from 'mongoose';
import { posts, users } from './constants';
import { transformDoc } from '@dolphjs/dolph/packages';
import { Pagination, mongoosePagination } from 'mongoose-paginate-ts';
import { IPost } from './interfaces';

const PostSchema = new Schema(
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
    catgeories: [{ type: String, required: true }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: users,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

PostSchema.plugin(transformDoc);
PostSchema.plugin(mongoosePagination);

export const PostModel: Pagination<IPost> = model<IPost, Pagination<IPost>>(posts, PostSchema);
