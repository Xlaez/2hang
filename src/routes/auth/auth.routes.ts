import { AuthController } from '@/src/controllers/auth.controllers';
import { login, newUser, sendOtp, verifyEmail } from '@/src/validations';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';

class AuthRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  controller: AuthController = new AuthController();

  path: string = '/v1/auth';
  initRoutes(): void {
    this.router.get(`${this.path}/otp/:email`, reqValidatorMiddleware(sendOtp), this.controller.sendOtp);
    this.router.post(`${this.path}/verify-email`, reqValidatorMiddleware(verifyEmail), this.controller.verifyEmail);
    this.router.post(`${this.path}/register`, reqValidatorMiddleware(newUser), this.controller.register);
    this.router.post(`${this.path}/login`, reqValidatorMiddleware(login), this.controller.login);
  }
}

export { AuthRouter };
