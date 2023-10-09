import { IPost, PostModel } from '@/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('postModel', PostModel)
export class PostService extends DolphServiceHandler<Dolph> {
  postModel!: mongoose.Model<IPost, mongoose.PaginateModel<IPost>>;
  constructor() {
    super('posts');
  }

  public readonly create = async (body: any) => {
    return this.postModel.create(body);
  };

  public readonly findById = async (id: string) => {
    return this.postModel.findById(id);
  };

  public readonly updateById = async (id: string, body: any) => {
    return this.postModel.findByIdAndUpdate(id, body);
  };
}
