import { PostsController } from '@/controllers/posts/posts.controller';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';

export class PostRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  path: string = '/v1/post';
  controller: PostsController = new PostsController();

  initRoutes(): void {
    this.router.post(`${this.path}`, this.controller.newPost);
  }
}
