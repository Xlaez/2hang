import { configs } from '@/configs';
import { Authorization } from '@/decorators';
import { Services } from '@/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import { Dolph, InternalServerErrorException, SuccessResponse, TryCatchAsyncDec } from '@dolphjs/dolph/common';
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
}
