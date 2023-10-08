import { mongoose } from '@dolphjs/dolph/packages';
import { notifications, users } from './constants';
import { transformDoc } from '@dolphjs/dolph/packages';
import paginate = require('mongoose-paginate-v2');

import { INotification } from './interfaces/notification.model.interfaces';

const NotificationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: users,
    },
    type: {
      type: String,
      required: true,
      default: 'user',
    },
    content: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.plugin(transformDoc);
NotificationSchema.plugin(paginate);

export const NotificationModel: mongoose.PaginateModel<INotification> = mongoose.model<
  INotification,
  mongoose.PaginateModel<INotification>
>(notifications, NotificationSchema);
