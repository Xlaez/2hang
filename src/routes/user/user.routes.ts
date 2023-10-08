import { UserController } from '@/src/controllers/user/user.controller';
import {
  acceptHagoutrequest,
  getHangoutRequest,
  getUserByID,
  getUserByUsername,
  getUserHangouts,
  sendHangoutRequest,
  updateUser,
} from '@/src/validations';
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
    this.router.get(
      `${this.path}/hangouts/requests`,
      reqValidatorMiddleware(getHangoutRequest),
      this.controller.getHangoutRequests,
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

    //  * PUT REQUESTS ======================================

    this.router.put(`${this.path}/profile`, reqValidatorMiddleware(updateUser), this.controller.updateProfille);
  }
}