import { INotification } from '@/models/interfaces/notification.model.interfaces';
import { NotificationModel } from '@/models/notification.models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('notificationModel', NotificationModel)
export class NotificationService extends DolphServiceHandler<Dolph> {
  notificationModel!: mongoose.Model<INotification, mongoose.PaginateModel<INotification>>;
  constructor() {
    super('notification');
  }

  public readonly create = async (body: any) => {
    return this.notificationModel.create(body);
  };

  public readonly send = async (body: any) => {
    /**
     * TODO: should send to websocket
     */

    return this.create(body);
  };
}
