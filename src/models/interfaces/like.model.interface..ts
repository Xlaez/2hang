import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';

export interface ILike extends mongoose.Document {
  user: IUser['_id'];
}
