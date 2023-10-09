import { HangRequestModel, IHangout, IUser, UserModel, HangoutModel, IHangRequest } from '@/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph, InternalServerErrorException } from '@dolphjs/dolph/common';
import { mongoose } from '@dolphjs/dolph/packages';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { paginationLabels } from '../../helpers';
import { sterilizeMultipleUserData } from '@/helpers/sterilize_data.hepers';

//TODO:  are users hangouts

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

  public async sendHangoutRequest(sender: string, receiver: string) {
    try {
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
    } catch (e) {
      throw e;
    }
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
    try {
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
    } catch (e) {
      throw e;
    }
  };

  public readonly cancelHangoutRequest = async (request_id: string) => {
    try {
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
    } catch (e) {
      throw e;
    }
  };

  public readonly queryUserByKeyword = async (keyword: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.userModel.paginate(
      {
        $or: [{ display_name: { $regex: keyword, $options: 'i' } }, { username: { $regex: keyword, $options: 'i' } }],
      },
      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        select: ['display_name', 'username', 'profile_img', 'hangouts', 'gender', 'location', 'createdAt'],
        ...options,
      },
    );
  };

  public readonly getUsersInALocation = async (state: string, country: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.userModel.paginate(
      {
        $and: [{ 'location.state': state }, { 'location.country': country }],
      },
      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        select: ['display_name', 'username', 'profile_img', 'hangouts', 'gender', 'location', 'createdAt'],
        ...options,
      },
    );
  };

  public readonly getUsersInCountry = async (country: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.userModel.paginate(
      { 'location.country': country },

      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        select: ['display_name', 'username', 'profile_img', 'hangouts', 'gender', 'location', 'createdAt'],
        ...options,
      },
    );
  };

  public async getMutualHangouts(currentUserIdString: string, userIdString: string, limit: number, page: number) {
    const currentUser_id = new mongoose.Types.ObjectId(currentUserIdString);

    const user_id = new mongoose.Types.ObjectId(userIdString);

    try {
      const currentUsersHangouts = await this.hangoutModel.findOne({ users: { $in: currentUser_id } }).exec();

      const otherUsersHangouts = await this.hangoutModel.findOne({ users: { $in: user_id } }).exec();

      if (!currentUsersHangouts || !otherUsersHangouts) return { mutualHangouts: [], totalMutualHangouts: 0, page, limit };

      const currentUsersHangoutsIds: string[] = currentUsersHangouts.users.map((user) => user.toString());
      const otherUsersHangoutsIds: string[] = otherUsersHangouts.users.map((user) => user.toString());

      const mutualHangoutsIds = currentUsersHangoutsIds.filter((id) => {
        if (otherUsersHangoutsIds.includes(id)) {
          if (id !== currentUserIdString) return otherUsersHangoutsIds.includes(id);
        }
      });

      const startAt = (page - 1) * limit;
      const endAt = page * limit;

      const paginatedMutualHangoutsIds = mutualHangoutsIds.slice(startAt, endAt);

      const totalMutualHangouts = mutualHangoutsIds.length;

      const mutualHangouts = await this.userModel
        .find({ $and: [{ _id: { $in: paginatedMutualHangoutsIds } }, { _id: { $ne: currentUserIdString } }] })
        .exec();

      return { mutualHangouts: sterilizeMultipleUserData(mutualHangouts), totalMutualHangouts, page, limit };
    } catch (e) {
      throw e;
    }
  }
}
