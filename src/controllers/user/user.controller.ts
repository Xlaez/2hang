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

  @TryCatchAsyncDec
  public async getUserByUsername(req: Request, res: Response) {
    const { username } = req.params;

    const user = await services.userService.findOne({ username });
    if (!user) throw new NotFoundException('user not found');

    SuccessResponse({ res, body: sterilizeUserData(user) });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getHangouts(req: Request, res: Response) {
    const { user_id, limit, page } = req.query;

    const hangouts = await services.userService.getHangouts(user_id.toString(), +limit, +page);

    if (!hangouts) throw new NotFoundException('user currently has no hangouts');

    SuccessResponse({ res, body: hangouts });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async sendHangoutRequest(req: Request, res: Response) {
    const { user_id } = req.body;

    if (await services.userService.hasRequestBeenSentByThisUser(req.user.toString(), user_id))
      throw new BadRequestException('a request has already been sent to this user');

    const didReceiverSendRequest = await services.userService.hasRequestBeenSentByOtherUser(req.user.toString(), user_id);

    if (didReceiverSendRequest) {
      const { receiver, receiver_id, sender, sender_id } = await services.userService.acceptHagoutrequest(
        didReceiverSendRequest._id,
      );

      await services.notificationService.send({
        label: 'new hangout!',
        user: receiver_id,
        type: 'user',
        content: `${sender} has accepted your request`,
      });

      await services.notificationService.send({
        label: 'new hangout!',
        user: sender_id,
        type: 'user',
        content: `${receiver} has accepted your request`,
      });

      return SuccessResponse({ res, body: { msg: 'request sent successfully' } });
    }

    await services.userService.sendHangoutRequest(req.user.toString(), user_id);
    SuccessResponse({ res, body: { msg: 'request sent successfully' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async acceptHangoutRequest(req: Request, res: Response) {
    const users = await services.userService.acceptHagoutrequest(req.body.request_id);

    await services.notificationService.send({
      label: 'new hangout!',
      user: users.sender_id,
      type: 'user',
      content: `${users.receiver} has accepted your request`,
    });

    return SuccessResponse({ res, body: { msg: 'request accepted successfully' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getHangoutRequests(req: Request, res: Response) {
    const { limit, page } = req.query;
    const requests = await services.userService.getHangoutRequests(req.user.toString(), +limit, +page);
    if (!requests) throw new NotFoundException('user has no hangouts');
    SuccessResponse({ res, body: requests });
  }
}

// Type of posts depending on what user is posting - fact, solution, idea, problem, opinion, random, image
// Get user interest after registering users
