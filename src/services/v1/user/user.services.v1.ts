import { IUser, UserModel } from '@/src/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { Pagination } from 'mongoose-paginate-ts';
import { Model } from 'mongoose';

@InjectMongo('userModel', UserModel)
export class UserService extends DolphServiceHandler<Dolph> {
  userModel!: Model<Pagination<IUser>>;
  constructor() {
    super('user');
  }

  create = async (body: IUser) => {
    return this.userModel.create(body);
  };

  findByEmail = async (email: string) => {
    return this.userModel.findOne({ email });
  };

  findById = async (id: string) => {
    return this.userModel.findById(id);
  };
}
