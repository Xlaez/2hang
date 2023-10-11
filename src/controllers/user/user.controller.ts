import { configs } from '@/configs';
import { Authorization } from '@/decorators';
import { sterilizeUserData } from '@/helpers/sterilize_data.hepers';
import { uploadOneToCloud } from '@/services/helpers';
import { Services } from '@/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
  TryCatchAsyncDec,
} from '@dolphjs/dolph/common';
import { MediaParser } from '@dolphjs/dolph/utilities';
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

    let hangouts = await services.userService.getHangouts(user_id.toString(), +limit, +page);

    if (!hangouts) throw new NotFoundException('user currently has no hangouts');

    let docs = [];
    hangouts.docs?.map((hangout) => {
      if (hangout.users[0]._id.toString() === user_id.toString()) {
        docs.push(hangout.users[1]);
      } else if (hangout.users[1]._id.toString() === user_id.toString()) {
        docs.push(hangout.users[0]);
      }
    });

    hangouts.docs = docs;
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
  public async cancelHangoutRequest(req: Request, res: Response) {
    await services.userService.cancelHangoutRequest(req.body.request_id);
    SuccessResponse({ res, body: { msg: 'request cancelled successfully' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getHangoutRequests(req: Request, res: Response) {
    const { limit, page } = req.query;
    const requests = await services.userService.getHangoutRequests(req.user.toString(), +limit, +page);
    if (!requests) throw new NotFoundException('user has no hangouts');

    SuccessResponse({ res, body: requests });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  @MediaParser({ fieldname: 'upload', type: 'single', extensions: ['.png', '.jpeg', '.jpg'] })
  public async updateProfileImg(req: Request, res: Response) {
    //@ts-expect-error
    const url = await uploadOneToCloud(req.file.path);
    if (!url) throw new InternalServerErrorException('cannot process request');

    const user = await services.userService.updateBylD(req.user, { profile_img: url });

    if (!user) throw new InternalServerErrorException('cannot proccess request');

    SuccessResponse({ res, body: user });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async searchUserByKeyword(req: Request, res: Response) {
    const { keyword, limit, page } = req.query;

    const users = await services.userService.queryUserByKeyword(keyword.toString(), +limit, +page);
    if (!users) throw new NotFoundException('user not found');
    SuccessResponse({ res, body: users });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getUserInLocation(req: Request, res: Response) {
    const { limit, page } = req.query;

    const user = await services.userService.findById(req.user);

    const users = await services.userService.getUsersInALocation(user.location.state, user.location.country, +limit, +page);

    SuccessResponse({ res, body: users });
  }

  // Used when user just creates an account

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getUsersInCountry(req: Request, res: Response) {
    const { limit, page } = req.query;

    const user = await services.userService.findById(req.user);

    const users = await services.userService.getUsersInCountry(user.location.country, +limit, +page);

    SuccessResponse({ res, body: users });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async updateUserInterest(req: Request, res: Response) {
    const user = await services.userService.updateBylD(req.user.toString(), { interests: req.body.interests });
    if (!user) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: user });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getMutualHangouts(req: Request, res: Response) {
    const { limit, page, user_id } = req.query;

    const users = await services.userService.getMutualHangouts(req.user.toString(), user_id.toString(), +limit, +page);

    SuccessResponse({ res, body: users });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async areUsersHangouts(req: Request, res: Response) {
    const result = await services.userService.areUsersHangouts(req.user.toString(), req.query.user_id.toString());
    console.log(result);
    SuccessResponse({ res, body: result ? true : false });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async blockUser(req: Request, res: Response) {
    const hangout = await services.userService.areUsersHangouts(req.user.toString(), req.body.user_id.toString());

    if (!hangout) throw new BadRequestException("cannot block a user that's not in yout hangout list");

    const result = await services.userService.updateHangoutByID(hangout.id, {
      $addToSet: { blocked_ids: req.body.user_id },
    });

    if (!result) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: result });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async unBlockUser(req: Request, res: Response) {
    const hangout = await services.userService.areUsersHangouts(req.user.toString(), req.body.user_id.toString());

    if (!hangout) throw new BadRequestException("cannot block a user that's not in yout hangout list");

    const result = await services.userService.updateHangoutByID(hangout.id, { $pull: { blocked_ids: req.body.user_id } });

    if (!result) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: result });
  }
}

// Type of posts depending on what user is posting - fact, solution, idea, problem, opinion, random, image
// Get user interest after registering users
// Add reporting features

// get users by interest
// get users with mutual hangouts -- you might wanna hangout

// notifications would be like - James has shared an idea, itoro has a solution
