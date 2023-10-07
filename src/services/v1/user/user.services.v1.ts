import { IUser, UserModel } from '@/src/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { mongoose } from '@dolphjs/dolph/packages';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { Pagination } from 'mongoose-paginate-ts';

@InjectMongo('userModel', UserModel)
export class UserService extends DolphServiceHandler<Dolph> {
  userModel!: mongoose.Model<IUser, Pagination<IUser>>;
  constructor() {
    super('user');
  }

  create = async (body: any) => {
    return this.userModel.create(body);
  };

  find = async (query: any) => {
    return this.userModel.find(query);
  };

  findOne = async (query: any) => {
    return this.userModel.findOne(query);
  };

  findByEmail = async (email: string) => {
    return this.userModel.findOne({ email });
  };

  findById = async (id: string) => {
    return this.userModel.findById(id);
  };

  updateByEmail = async (email: string, body: any) => {
    return this.userModel.updateOne({ email }, body, { new: true });
  };

  updateBylD = async (_id: string | mongoose.Types.ObjectId, body: any) => {
    return this.userModel.updateOne({ _id }, body, { new: true });
  };
}
