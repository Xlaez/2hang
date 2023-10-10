import { configs } from '@/configs';
import { Authorization } from '@/decorators';
import { isTimeFrameMoreThanThreeDays } from '@/helpers';
import { Services } from '@/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
  TryCatchAsyncDec,
  UnauthorizedException,
} from '@dolphjs/dolph/common';
import { Request, Response } from 'express';

const services = new Services();

export class PostsController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async newPost(req: Request, res: Response) {
    if (!(await services.postService.create({ ...req.body, owner: req.user })))
      throw new InternalServerErrorException('cannot process request');

    const userHangouts = await services.userService.getHangouts(req.user.toString(), 1000, 1);

    // TODO: in future, use pagination to send notifications in batches of 100's to users to ensure scalability
    let hangouts = [];
    if (userHangouts.docs?.length) {
      userHangouts.docs.map((user) => {
        if (user.users[0]._id.toString() === req.user.toString()) {
          hangouts.push({
            label: 'a new post',
            user: user.users[1]._id.toString(),
            type: 'post',
            content: `${user.users[0].display_name} posted a ${req.body.type}`,
          });
        } else if (user.users[1]._id.toString() === req.user.toString()) {
          hangouts.push({
            label: 'a new post',
            user: user.users[0]._id.toString(),
            type: 'post',
            content: `${user.users[1].display_name} posted a ${req.body.type}`,
          });
        }
      });

      if (!(await services.notificationService.sendToMany(hangouts)))
        throw new InternalServerErrorException('cannot process request');
    }

    SuccessResponse({ res, body: { msg: 'post created' }, status: 201 });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async editPost(req: Request, res: Response) {
    const post = await services.postService.findById(req.body.post_id);

    if (!post) throw new NotFoundException('post does not exist');

    if (req.user.toString() !== post.owner.toString())
      throw new UnauthorizedException('cannot edit this resource, you don not have the authority');

    if (isTimeFrameMoreThanThreeDays(post.createdAt))
      throw new BadRequestException('cannot edit post that is older than 3 days');

    if (req.body.content) {
      post.content = req.body.content;
    }

    if (req.body.type !== null || req.body.type !== undefined) {
      post.public = req.body.public;
    }

    if (!(await post.save())) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: { msg: 'post updated successfully' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async deletePost(req: Request, res: Response) {
    const post = await services.postService.findById(req.params.post_id);

    if (!post) throw new NotFoundException('post does not exist');

    if (req.user.toString() !== post.owner.toString())
      throw new UnauthorizedException('cannot delete this resource, you don not have the authority');

    if (!(await post.remove())) throw new InternalServerErrorException('cannot proccess request');

    SuccessResponse({ res, body: { msg: 'post has been deleted' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getPostById(req: Request, res: Response) {
    // with interest returned, app can check if they match user's and pair them
    const post = await services.postService.findByIdAndPopulate(req.params.post_id);

    if (!post) throw new NotFoundException('post does not exist, it might have been deleted by the owner');
    SuccessResponse({ res, body: post });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getPostLikers(req: Request, res: Response) {
    const usersThatLikedPost = await services.postService.findByIdAndReturnLikers(req.params.post_id);

    if (usersThatLikedPost.owner.toString() !== req.user.toString())
      throw new UnauthorizedException('cannot delete this resource, you don not have the authority');

    SuccessResponse({ res, body: usersThatLikedPost });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async queryPostsByType(req: Request, res: Response) {
    const { limit, type, page } = req.query;
    const posts = await services.postService.queryPostsByType(type.toString(), +limit, +page);

    if (!posts) throw new NotFoundException('posts not found');
    SuccessResponse({ res, body: posts });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getRecentPostsFromHangouts(req: Request, res: Response) {
    // implement with pagination
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getRecentPostsFromPeopleInNearbyLocation(req: Request, res: Response) {
    // implement with pagination
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getRecentPostsFromUsersWithMostHangouts(req: Request, res: Response) {
    // implement with pagination
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async LikePost(req: Request, res: Response) {
    const hasUserLikedPost = await services.postService.hasLikedPost(req.user.toString(), req.params.post_id.toString());

    let returnResult: any;

    if (hasUserLikedPost) {
      // if user has liked post then unlike
      returnResult = await services.postService.updateById(req.params.post_id.toString(), {
        $inc: { nb_likes: -1 },
        $pull: { likes: { user: req.user.toString() } },
      });

      if (!returnResult) throw new InternalServerErrorException('cannot proccess request');
    } else {
      returnResult = await services.postService.updateById(req.params.post_id.toString(), {
        $inc: { nb_likes: 1 },
        $push: { likes: { user: req.user.toString() } },
      });

      if (!returnResult) throw new InternalServerErrorException('cannot proccess request');
    }

    SuccessResponse({ res, body: returnResult });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async addReply(req: Request, res: Response) {
    const { post_id, text, parent_id } = req.body;

    const { post, reply } = await services.postService.newReply(post_id, text, req.user.toString(), parent_id || '');

    if (!reply && !post) throw new InternalServerErrorException('cannot process request');

    const user = await services.userService.findById(req.user);

    if (reply && !post) {
      await services.notificationService.send({
        label: 'someone responded to your reply',
        user: reply.owner,
        type: 'reply',
        content: `${user.display_name} responded to your reply`,
      });
    } else if (post && !reply) {
      // Todo - trim post.content
      await services.notificationService.send({
        label: 'someone resplied your post',
        user: post.owner,
        type: 'post',
        content: `${user.display_name} resplied your post ${post.content}`,
      });
    }

    SuccessResponse({ res, body: post || reply });
  }
}

// Todo - block and unblok user
