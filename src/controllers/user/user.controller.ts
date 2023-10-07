import { configs } from '@/src/configs';
import { Authorization } from '@/src/decorators';
import { sterilizeUserData } from '@/src/helpers/sterilize_data.hepers';
import { Services } from '@/src/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
  TryCatchAsyncDec,
} from '@dolphjs/dolph/common';
import { Request, Response } from 'express';

const services = new Services();

export class UserController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getProfile(req: Request, res: Response) {
    const user = await services.userService.findById(req.user);
    if (!user) throw new NotFoundException('user not found');
    SuccessResponse({ res, body: sterilizeUserData(user) });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getUserByID(req: Request, res: Response) {
    const user = await services.userService.findById(req.params.user_id);
    if (!user) throw new NotFoundException('user not found');
    SuccessResponse({ res, body: sterilizeUserData(user) });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async updateProfille(req: Request, res: Response) {
    const { username } = req.body;
    if (await services.userService.isUsernameAvailable(username)) throw new BadRequestException('username is not available');

    const user = await services.userService.updateBylD(req.user, req.body);

    if (!user) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: sterilizeUserData(user) });
  }
}
