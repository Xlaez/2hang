import { IHangout, MessageModel } from '@/models';
import { IMessage } from '@/models/interfaces/message.model.interfaces';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph, NotFoundException } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('messageModel', MessageModel)
export class MessageService extends DolphServiceHandler<Dolph> {
  messageModel!: mongoose.Model<IMessage, mongoose.PaginateModel<IMessage>>;
  hangoutModel!: mongoose.Model<IHangout, mongoose.PaginateModel<IHangout>>;
  constructor() {
    super('message');
  }

  public readonly newMessage = async (body: any) => {
    return this.messageModel.create(body);
  };

  public readonly getMessagesByHangoutId = async (filter: any, options: any) => {
    // @ts-expect-error
    return this.messageModel.paginate({ ...filter }, { ...options });
  };

  public readonly markMessageAsRead = async (hangoutId: string, userId: string) => {
    return this.messageModel.updateMany(
      { hangout_id: hangoutId, 'read_by.user': { $ne: userId } },
      { $addToSet: { read_by: { user: userId } } },
      { multi: true },
    );
  };

  public readonly deleteMessage = async (userId: string, messageId: string) => {
    try {
      let message = await this.messageModel.findOne({ _id: messageId });

      if (!message) throw new NotFoundException('message not found');

      if (message.sender.toString() === userId) {
        const hangout = await this.hangoutModel.findById(message.hangout_id);
        message.deleted_for.push(hangout.users.map((i) => i));
      } else {
        message.deleted_for.push(userId);
      }

      message = await message.save();
      return message;
    } catch (e) {
      throw e;
    }
  };
}

//nmae- Treff
