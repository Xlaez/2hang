import { Document } from 'mongoose';
import { IUser } from './user.model.interfaces';

export interface IPost extends Document {
  content: string;
  tags: string[];
  public: boolean;
  categories: string[];
  owner: IUser['id'];
  createdAt: Date;
  updatedAt: Date;
}
