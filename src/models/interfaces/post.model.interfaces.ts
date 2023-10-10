import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';
import { postType } from '../types';
import { ILike } from './like.model.interface.';
// Add views in V2
export interface IPost extends mongoose.Document {
  content: string;
  tags: string[];
  public: boolean;
  owner: IUser['id'];
  nb_replies: number;
  nb_likes: number;
  likes: ILike[];
  type: postType;
  createdAt: Date;
  updatedAt: Date;
}
