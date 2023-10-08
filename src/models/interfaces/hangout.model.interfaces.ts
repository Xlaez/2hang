import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';

export interface IHangout extends mongoose.Document {
  users: IUser['_id'][];
  blocked_ids: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}
