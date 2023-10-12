import { minifyUserData, sterilizeUserData } from '@/helpers';
import { HangoutModel, IHangout, IPost, IReply, IUser, PostModel, ReplyModel, UserModel, posts } from '@/models';
import { paginationLabels } from '@/services/helpers';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { BadRequestException, Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('postModel', PostModel)
@InjectMongo('replyModel', ReplyModel)
@InjectMongo('userModel', UserModel)
@InjectMongo('hangoutModel', HangoutModel)
export class PostService extends DolphServiceHandler<Dolph> {
  postModel!: mongoose.Model<IPost, mongoose.PaginateModel<IPost>>;
  replyModel!: mongoose.Model<IReply, mongoose.PaginateModel<IReply>>;
  userModel!: mongoose.Model<IUser, mongoose.PaginateModel<IUser>>;
  hangoutModel!: mongoose.Model<IHangout, mongoose.PaginateModel<IHangout>>;

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
    const post = await this.postModel.findById(id).select(['-content -tags -public -type -createdAt -updatedAt']).lean();
    const users = [];
    for (const like of post.likes) {
      const userInfo = await this.userModel.findById(like.user);
      users.push(minifyUserData(userInfo));
    }
    return { ...post, likes: users };
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
    return this.postModel.findByIdAndUpdate(id, body, { new: true });
  };

  public readonly hasLikedPost = async (userId: string, postId: string) => {
    return this.postModel.findOne({
      $and: [{ _id: postId }, { likes: { $in: { user: new mongoose.Types.ObjectId(userId) } } }],
    });
  };

  public readonly hasLikedReply = async (userId: string, replyId: string) => {
    return this.replyModel.findOne({
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

      reply = await this.replyModel.findByIdAndUpdate(
        parentId,
        {
          $inc: { nb_children: 1 },
        },
        { new: true },
      );
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
        { new: true },
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

  public readonly updateReplyById = async (id: string, body: any) => {
    return this.replyModel.findByIdAndUpdate(id, body, { new: true });
  };

  public readonly getRecentPostsFromHangouts = async (userId: string, limit: number, skip: number) => {
    try {
      const hangoutPosts = await this.hangoutModel.aggregate([
        {
          $match: { users: new mongoose.Types.ObjectId(userId) },
        },
        {
          $unwind: '$users',
        },
        {
          $match: { users: { $ne: new mongoose.Types.ObjectId(userId) } },
        },
        {
          $group: {
            _id: '$users',
            latestPosts: { $max: '$createdAt' },
          },
        },
        // {
        //   $lookup: {
        //     from: posts,
        //     localField: '_id',
        //     foreignField: 'owner',
        //     as: 'userPosts',
        //   },
        // },
        // {
        //   $addFields: {
        //     userPosts: { $arrayElemAt: ['$userPosts', 0] },
        //   },
        // },
        // {
        //   $sort: { latestPosts: -1 },
        // },
        // {
        //   $skip: skip,
        //   $limit: limit,
        // },
      ]);
      console.log(hangoutPosts);
      return hangoutPosts;
    } catch (e) {
      throw e;
    }
  };
}
