import { PostsController } from '@/controllers/posts/posts.controller';
import {
  addReply,
  deletePost,
  deleteReply,
  editPost,
  editReply,
  getRecentHangoutPosts,
  getReplies,
  getResponds,
  newPost,
  queryPostsByType,
} from '@/validations';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';

export class PostRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  path: string = '/v1/post';
  controller: PostsController = new PostsController();

  initRoutes(): void {
    this.router.get(`${this.path}/likers/:post_id`, reqValidatorMiddleware(deletePost), this.controller.getPostLikers);

    this.router.get(`${this.path}/by-type`, reqValidatorMiddleware(queryPostsByType), this.controller.queryPostsByType);

    this.router.get(`${this.path}/replies`, reqValidatorMiddleware(getReplies), this.controller.getRepliesForPost);

    this.router.get(`${this.path}/responds`, reqValidatorMiddleware(getResponds), this.controller.getRespondsForReplies);

    this.router.get(
      `${this.path}/recent-hangouts-posts`,
      reqValidatorMiddleware(getRecentHangoutPosts),
      this.controller.getRecentPostsFromHangouts,
    );

    this.router.get(
      `${this.path}/recent-nearbypeeps-posts`,
      reqValidatorMiddleware(getRecentHangoutPosts),
      this.controller.getRecentPostsFromPeopleInNearbyLocation,
    );

    this.router.get(`${this.path}/:post_id`, reqValidatorMiddleware(deletePost), this.controller.getPostById);

    this.router.post(`${this.path}`, reqValidatorMiddleware(newPost), this.controller.newPost);

    this.router.post(`${this.path}/reply`, reqValidatorMiddleware(addReply), this.controller.addReply);

    this.router.post(`${this.path}/like/:post_id`, reqValidatorMiddleware(deletePost), this.controller.LikePost);

    this.router.post(`${this.path}/reply/like/:reply_id`, reqValidatorMiddleware(deleteReply), this.controller.likeReply);

    this.router.put(`${this.path}`, reqValidatorMiddleware(editPost), this.controller.editPost);

    this.router.put(`${this.path}/reply`, reqValidatorMiddleware(editReply), this.controller.editReply);

    this.router.delete(`${this.path}/reply/:reply_id`, reqValidatorMiddleware(deleteReply), this.controller.deleteReply);

    this.router.delete(`${this.path}/:post_id`, reqValidatorMiddleware(deletePost), this.controller.deletePost);
  }
}
