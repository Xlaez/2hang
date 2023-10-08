import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';

export interface IHangRequest extends mongoose.Document {
  sender: IUser['_id'];
  receiver: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}
