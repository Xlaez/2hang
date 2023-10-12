import { mongoose } from '@dolphjs/dolph/packages';
import { IReadBy } from './read_by.model.interface';

export interface IMessage extends mongoose.Document {
  hangout_id: mongoose.Types.ObjectId;
  message: mongoose.Schema.Types.Mixed;
  sender: mongoose.Types.ObjectId;
  read_by: IReadBy[];
  createdAt: Date;
  updatedAt: Date;
}
