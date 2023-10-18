import { UserAdminController } from '@/controllers/admin/user.controllers.admin';
import { activateSuperAdminAccount, newSuperAdmin } from '@/validations';
import { DolphControllerHandler, DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';

export class AdminRoutes extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }

  path: string = '/v1/admin/secure';
  controller: UserAdminController = new UserAdminController();

  initRoutes(): void {
    this.router.get(`${this.path}/most-popular`, this.controller.getUsersWithMostHangouts);

    this.router.post(
      `${this.path}/create-super-admin`,
      reqValidatorMiddleware(newSuperAdmin),
      this.controller.createSuperAdminAccount,
    );

    this.router.post(
      `${this.path}/activate-account`,
      reqValidatorMiddleware(activateSuperAdminAccount),
      this.controller.activateSuperAdminAccount,
    );
  }
}
