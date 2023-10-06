import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';

export interface IPost extends mongoose.Document {
  content: string;
  tags: string[];
  public: boolean;
  categories: string[];
  owner: IUser['id'];
  createdAt: Date;
  updatedAt: Date;
}
