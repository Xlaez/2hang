import { IPost, IReply, PostModel, ReplyModel } from '@/models';
import { paginationLabels } from '@/services/helpers';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { BadRequestException, Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('postModel', PostModel)
@InjectMongo('replyModel', ReplyModel)
export class PostService extends DolphServiceHandler<Dolph> {
  postModel!: mongoose.Model<IPost, mongoose.PaginateModel<IPost>>;
  replyModel!: mongoose.Model<IReply, mongoose.PaginateModel<IReply>>;
  constructor() {
    super('posts');
  }

  public readonly create = async (body: any) => {
    return this.postModel.create(body);
  };

  public readonly findById = async (id: string) => {
    return this.postModel.findById(id);
  };

  public readonly findByIdAndPopulate = async (id: string) => {
    return this.postModel.findById(id).populate('owner', 'id username display_name profile_img interests');
  };

  public readonly findByIdAndReturnLikers = async (id: string) => {
    return this.postModel.findById(id).populate('likes.user', 'id username display_name profile_img interests');
  };

  public readonly queryPostsByType = async (type: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };
    //@ts-expect-error
    return this.postModel.paginate(
      { type },

      {
        ...(limit ? { limit } : { limit: 10 }),
        page,
        sort: 'asc',
        populate: { path: 'owner', select: 'display_name username profile_img interests' },
        ...options,
      },
    );
  };

  public readonly updateById = async (id: string, body: any) => {
    return this.postModel.findByIdAndUpdate(id, body);
  };

  public readonly hasLikedPost = async (userId: string, postId: string) => {
    return this.postModel.findOne({
      $and: [{ _id: postId }, { likes: { $in: { user: new mongoose.Types.ObjectId(userId) } } }],
    });
  };

  public readonly hasLikedReply = async (userId: string, replyId: string) => {
    return this.postModel.findOne({
      $and: [{ _id: replyId }, { likes: { $in: { user: new mongoose.Types.ObjectId(userId) } } }],
    });
  };

  public readonly newReply = async (postId: string, text: string, owner: string, parentId?: string) => {
    let newReply = new this.replyModel({
      owner,
      post_id: postId,
      text,
    });

    let reply: IReply | null;
    if (parentId) {
      const parentReply = await this.replyModel.findById(parentId);
      if (!parentReply) throw new BadRequestException('cannot add reply');

      newReply.parent_id = parentReply.id;
      newReply.is_child = true;

      reply = await this.replyModel.findByIdAndUpdate(parentId, {
        $inc: { nb_children: 1 },
      });
    }

    newReply = await newReply.save();

    let post: IPost | null;
    // update post replies
    if (!parentId) {
      post = await this.postModel.findByIdAndUpdate(
        { _id: postId },
        {
          $inc: { nb_replies: 1 },
        },
      );
    }

    return { post, reply };
  };

  public readonly getReplies = async (
    postId: string,
    limit: number,
    page: number,
    orderBy?: string,
    sortBy: string = 'asc',
  ) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.replyModel.paginate(
      { $and: [{ post_id: postId }, { is_child: false }] },
      {
        ...(limit ? { limit } : { limit: 20 }),
        page,
        sort: { [orderBy]: sortBy === 'asc' ? 1 : -1 },
        ...options,
        populate: { path: 'owner', select: '_id, username display_name profile_img' },
      },
    );
  };

  public readonly getResponds = async (postId: string, parentId: string, limit: number, page: number) => {
    const options = {
      lean: true,
      customLabels: paginationLabels,
    };

    //@ts-expect-error
    return this.replyModel.paginate(
      { $and: [{ post_id: postId }, { is_child: true }, { parent_id: parentId }] },
      {
        ...(limit ? { limit } : { limit: 20 }),
        page,
        ...options,
        populate: { path: 'owner', select: '_id, username display_name profile_img' },
      },
    );
  };
}
