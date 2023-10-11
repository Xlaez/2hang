import { UserController } from '@/controllers/user/user.controller';
import {
  acceptHagoutrequest,
  areUsersHangouts,
  blockHangout,
  getHangoutRequest,
  getUserByID,
  getUserByUsername,
  getUserHangouts,
  searchUserByKeyword,
  sendHangoutRequest,
  updateInterests,
  updateUser,
} from '@/validations';
import { DolphControllerHandler, DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';
import cookieParser = require('cookie-parser');

export class UserRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }

  controller: UserController = new UserController();
  path: string = '/v1/user';

  initRoutes(): void {
    this.router.use(cookieParser({}));

    // * GET REQUESTS =====================================
    this.router.get(`${this.path}/profile`, this.controller.getProfile);

    this.router.get(`${this.path}/profile/:user_id`, reqValidatorMiddleware(getUserByID), this.controller.getUserByID);

    this.router.get(`${this.path}/hangouts`, reqValidatorMiddleware(getUserHangouts), this.controller.getHangouts);

    this.router.get(`${this.path}/are-hangouts`, reqValidatorMiddleware(areUsersHangouts), this.controller.areUsersHangouts);

    this.router.get(
      `${this.path}/hangouts/requests`,
      reqValidatorMiddleware(getHangoutRequest),
      this.controller.getHangoutRequests,
    );

    this.router.get(`${this.path}/query`, reqValidatorMiddleware(searchUserByKeyword), this.controller.searchUserByKeyword);

    this.router.get(
      `${this.path}/my-location`,
      reqValidatorMiddleware(getHangoutRequest),
      this.controller.getUserInLocation,
    );

    this.router.get(`${this.path}/my-country`, reqValidatorMiddleware(getHangoutRequest), this.controller.getUsersInCountry);

    this.router.get(
      `${this.path}/mutual-hangouts`,
      reqValidatorMiddleware(getUserHangouts),
      this.controller.getMutualHangouts,
    );

    this.router.get(`${this.path}/:username`, reqValidatorMiddleware(getUserByUsername), this.controller.getUserByUsername);

    //* POST REQUESTS =====================================
    this.router.post(
      `${this.path}/hangouts`,
      reqValidatorMiddleware(sendHangoutRequest),
      this.controller.sendHangoutRequest,
    );

    this.router.post(
      `${this.path}/accept-hangout`,
      reqValidatorMiddleware(acceptHagoutrequest),
      this.controller.acceptHangoutRequest,
    );

    this.router.post(
      `${this.path}/cancel-hangout`,
      reqValidatorMiddleware(acceptHagoutrequest),
      this.controller.cancelHangoutRequest,
    );

    this.router.post(`${this.path}/block-hangout`, reqValidatorMiddleware(blockHangout), this.controller.blockUser);

    this.router.post(`${this.path}/unblock-hangout`, reqValidatorMiddleware(blockHangout), this.controller.unBlockUser);

    //  * PUT REQUESTS ======================================

    this.router.put(`${this.path}/profile`, reqValidatorMiddleware(updateUser), this.controller.updateProfille);
    this.router.put(`${this.path}/profile-img`, this.controller.updateProfileImg);
    this.router.put(
      `${this.path}/update-interest`,
      reqValidatorMiddleware(updateInterests),
      this.controller.updateUserInterest,
    );
  }
}
