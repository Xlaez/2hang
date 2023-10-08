import { HangRequestModel, IHangout, IUser, UserModel, HangoutModel, IHangRequest } from '@/src/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph, InternalServerErrorException, TryCatchAsyncDec } from '@dolphjs/dolph/common';
import { mongoose } from '@dolphjs/dolph/packages';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import paginate = require('mongoose-paginate-v2');
import { paginationLabels } from '../../helpers';
import { transactionOptions } from '@/src/constants';

@InjectMongo('userModel', UserModel)
@InjectMongo('hangoutModel', HangoutModel)
@InjectMongo('hangRequestModel', HangRequestModel)
export class UserService extends DolphServiceHandler<Dolph> {
  userModel!: mongoose.Model<IUser, mongoose.PaginateModel<IUser>>;
  hangoutModel!: mongoose.Model<IHangout, mongoose.PaginateModel<IHangout>>;
  hangRequestModel!: mongoose.Model<IHangRequest, mongoose.PaginateModel<IHangRequest>>;

  constructor() {
    super('user');
  }

  public readonly create = async (body: any) => {
    return this.userModel.create(body);
  };

  public readonly find = async (query: any) => {
    return this.userModel.find(query);
  };

  public readonly findOne = async (query: any) => {
    return this.userModel.findOne(query);
  };

  public readonly findByEmail = async (email: string) => {
    return this.userModel.findOne({ email });
  };

  public readonly findById = async (id: any) => {
    return this.userModel.findById(id);
  };

  public readonly deleteById = async (id: any) => {
    return this.userModel.findByIdAndDelete(id);
  };

  public readonly updateByEmail = async (email: string, body: any) => {
    return this.userModel.updateOne({ email }, body, { new: true });
  };

  public readonly updateBylD = async (_id: string | mongoose.Types.ObjectId | any, body: any) => {
    return this.userModel.findOneAndUpdate({ _id }, body, { new: true });
  };

  public readonly isUsernameAvailable = async (username: string) => {
    return this.findOne({ username });
  };

  public readonly getHangouts = async (userId: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };
    //@ts-expect-error
    return this.hangoutModel.paginate(
      { users: { $in: userId } },

      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        populate: { path: 'users', select: 'display_name username profile_img hangouts gender location createdAt' },
        ...options,
      },
    );
  };

  @TryCatchAsyncDec
  public async sendHangoutRequest(sender: string, receiver: string) {
    const session = await this.hangRequestModel.startSession();

    await session.withTransaction(
      async () => {
        const request = await this.hangRequestModel.create({
          sender,
          receiver,
        });
        if (!request) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        if (!(await this.userModel.findByIdAndUpdate(sender, { $inc: { sent_hangout_req: 1 } }, session))) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        if (!(await this.userModel.findByIdAndUpdate(receiver, { $inc: { hangout_req: 1 } }, session))) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }
      },
      { readPreference: 'primary', readConcern: { level: 'local' }, writeConcern: { w: 'majority' } },
    );
    return true;
  }

  public readonly areUsersHangouts = async (user1: string, user2: string) => {
    return this.hangoutModel.findOne({
      users: { $all: [new mongoose.Types.ObjectId(user1), new mongoose.Types.ObjectId(user2)] },
    });
  };

  public readonly getHangoutRequests = async (user_id: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.hangRequestModel.paginate(
      {
        receiver: user_id,
      },
      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        populate: { path: 'sender', select: 'display_name username profile_img hangouts gender location createdAt' },
        ...options,
      },
    );
  };

  public readonly hasRequestBeenSentByThisUser = async (sender: string, receiver: string) => {
    return this.hangRequestModel.findOne({ $and: [{ sender }, { receiver }] });
  };

  public readonly hasRequestBeenSentByOtherUser = async (sender: string, receiver: string) => {
    return this.hangRequestModel.findOne({ $and: [{ sender: receiver }, { receiver: sender }] });
  };

  public readonly acceptHagoutrequest = async (request_id: string) => {
    const session = await this.hangRequestModel.startSession();

    let users: { sender: string; sender_id: string; receiver: string; receiver_id: string } = {
      sender: '',
      receiver: '',
      receiver_id: '',
      sender_id: '',
    };

    await session.withTransaction(
      async () => {
        const request = await this.hangRequestModel.findByIdAndDelete(request_id, session);

        if (!request) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        const updateSender = await this.userModel.findByIdAndUpdate(
          request.sender,
          { $inc: { sent_hangout_req: -1, hangouts: 1 } },
          session,
        );

        if (!updateSender) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        users.sender = updateSender.display_name;
        users.sender_id = updateSender._id;

        const updateReceiver = await this.userModel.findByIdAndUpdate(
          request.receiver,
          { $inc: { hangout_req: -1, hangouts: 1 } },
          session,
        );

        if (!updateReceiver) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        users.receiver = updateReceiver.display_name;
        users.receiver_id = updateReceiver._id;
        if (
          !(await this.hangoutModel.create({
            users: [request.receiver, request.sender],
          }))
        ) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }
      },
      { readPreference: 'primary', readConcern: { level: 'local' }, writeConcern: { w: 'majority' } },
    );
    return users;
  };

  public readonly cancelHangoutRequest = async (request_id: string) => {
    const session = await this.hangRequestModel.startSession();

    await session.withTransaction(
      async () => {
        const request = await this.hangRequestModel.findByIdAndDelete(request_id, session);
        if (!request) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        if (!(await this.userModel.findByIdAndUpdate(request.sender, { $inc: { sent_hangout_req: -1 } }, session))) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }

        if (!(await this.userModel.findByIdAndUpdate(request.receiver, { $inc: { hangout_req: -1 } }, session))) {
          await session.abortTransaction();
          throw new InternalServerErrorException('cannot proceed with request');
        }
      },
      { readPreference: 'primary', readConcern: { level: 'local' }, writeConcern: { w: 'majority' } },
    );
    return true;
  };
}
