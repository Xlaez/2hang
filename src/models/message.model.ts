import { mongoose, transformDoc } from '@dolphjs/dolph/packages';
import { hangouts, messages, users } from './constants';
import { ReadBySchema } from './schemas';
import paginate = require('mongoose-paginate-v2');
import { IMessage } from './interfaces/message.model.interfaces';

const MessageSchema = new mongoose.Schema(
  {
    hangout_id: {
      type: mongoose.Types.ObjectId,
      ref: hangouts,
    },
    message: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
    read_by: [ReadBySchema],
  },
  {
    timestamps: true,
  },
);

MessageSchema.plugin(transformDoc);
MessageSchema.plugin(paginate);

export const MessageModel: mongoose.PaginateModel<IMessage> = mongoose.model<IMessage, mongoose.PaginateModel<IMessage>>(
  messages,
  MessageSchema,
);
