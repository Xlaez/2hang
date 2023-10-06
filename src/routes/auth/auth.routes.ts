import { AuthController } from '@/src/controllers/auth.controllers';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';

class AuthRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  controller: AuthController = new AuthController();

  path: string = '/v1/auth';
  initRoutes(): void {
    this.router.get(`${this.path}/otp/:email`, this.controller.sendOtp);
  }
}

export { AuthRouter };
