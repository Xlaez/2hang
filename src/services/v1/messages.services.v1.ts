import { HangoutModel, IHangout, MessageModel, hangouts, users } from '@/models';
import { IMessage } from '@/models/interfaces/message.model.interfaces';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph, NotFoundException } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('messageModel', MessageModel)
@InjectMongo('hangoutModel', HangoutModel)
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

        hangout.users.forEach((user) => {
          message.deleted_for.push(user);
        });
      } else {
        message.deleted_for.push(userId);
      }

      message = await message.save();
      return message;
    } catch (e) {
      throw e;
    }
  };

  public readonly getRecentMsgsFromAllHangouts = async (hangout_ids: string[], user_id: string) => {
    const messages = this.messageModel.aggregate(
      [
        {
          $match: { hangout_id: { $in: hangout_ids } },
        },

        {
          $project: {
            unread: {
              $cond: [{ $in: [user_id, '$read_by.user_id'] }, 0, 1],
            },
            hangout_id: 1,
            message: 1,
            sender: 1,
            read_by: 1,
            createdAt: 1,
            updatedAt: 1,
            deleted_for: 1,
          },
        },

        {
          $group: {
            _id: '$hangout_id',
            msg_id: { $last: '$_id' },
            hangout_id: { $last: '$hangout_id' },
            msg: { $last: '$message' },
            sender: { $last: '$sender' },
            unread: { $sum: '$unread' },
            createdAt: { $last: '$createdAt' },
            read_by: { $last: '$read_by' },
            deleted_for: { $last: '$deleted_for' },
            updatedAt: { $last: '$updatedAt' },
          },
        },

        { $sort: { createdAt: -1 } },

        {
          $lookup: {
            from: hangouts,
            localField: 'hangout_id',
            foreignField: '_id',
            as: 'hangoutData',
          },
        },

        { $unwind: '$hangoutData' },
        { $unwind: '$hangoutData.users' },

        {
          $lookup: {
            from: users,
            localField: 'hangoutData.users',
            foreignField: '_id',
            as: 'hangoutData.usersProfiles',
          },
        },

        {
          $group: {
            _id: '$hangoutData._id',
            msg_id: { $last: '$msg_id' },
            hangout_id: { $last: '$hangout_id' },
            msg: { $last: '$msg' },
            sender: { $last: '$sender' },
            read_by: { $addToSet: '$read_by' },
            hangoutData: { $addToSet: '$hangoutData.usersProfiles' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' },
            unread: { $sum: '$unread' },
            deleted_for: { $last: '$deleted_for' },
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      { allowDiskUse: true },
    );

    return messages;
  };

  public readonly updateById = async (id: string, body: any) => {
    return this.messageModel.findByIdAndUpdate(id, body, { new: true });
  };
}

//nmae- Treff
