import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';
import { notifications } from '../types';

export interface INotification extends mongoose.Document {
  label: string;
  user: IUser['id'];
  type: notifications;
  content: string;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
