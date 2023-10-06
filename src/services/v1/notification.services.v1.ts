import { INotification } from '@/src/models/interfaces/notification.model.interfaces';
import { NotificationModel } from '@/src/models/notification.models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';
import { Model } from 'mongoose';
import { Pagination } from 'mongoose-paginate-ts';

@InjectMongo('notificationModel', NotificationModel)
export class NotificationService extends DolphServiceHandler<Dolph> {
  notificationModel!: mongoose.Model<INotification, Pagination<INotification>>;
  constructor() {
    super('notification');
  }

  public readonly create = async (body: INotification) => {
    return this.notificationModel.create(body);
  };
}
