import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';
import { postType } from '../types';

export interface IPost extends mongoose.Document {
  content: string;
  tags: string[];
  public: boolean;
  owner: IUser['id'];
  type: postType;
  createdAt: Date;
  updatedAt: Date;
}
