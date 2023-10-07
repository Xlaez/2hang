import { UserController } from '@/src/controllers/user/user.controller';
import { getUserByID, updateUser } from '@/src/validations';
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
    this.router.get(`${this.path}/profile`, this.controller.getProfile);
    this.router.get(`${this.path}/profile/:user_id`, reqValidatorMiddleware(getUserByID), this.controller.getUserByID);
    this.router.put(`${this.path}/profile`, reqValidatorMiddleware(updateUser), this.controller.updateProfille);
  }
}
