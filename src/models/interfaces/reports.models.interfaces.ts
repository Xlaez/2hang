import { mongoose } from '@dolphjs/dolph/packages';
import { reportType } from '../types';
import { IUser } from './user.model.interfaces';

export interface IReport extends mongoose.Document {
  type: reportType;
  details: string;
  createdAt: Date;
  updatedAt: Date;
  reporter_id: IUser['_id'];
  reported_id: IUser['_id'];
}
