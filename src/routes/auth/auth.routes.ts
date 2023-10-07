import { AuthController } from '@/src/controllers/auth.controllers';
import { login, newUser, sendOtp, sendPhoneOtp, verifyEmail, verifyPhoneNo } from '@/src/validations';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';
import cookieParser = require('cookie-parser');

class AuthRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  controller: AuthController = new AuthController();

  path: string = '/v1/auth';
  initRoutes(): void {
    this.router.use(cookieParser());
    this.router.get(`${this.path}/otp/:email`, reqValidatorMiddleware(sendOtp), this.controller.sendOtp);
    this.router.get(`${this.path}/phone-otp/:phone_no`, reqValidatorMiddleware(sendPhoneOtp), this.controller.sendPhoneOtp);

    this.router.post(`${this.path}/verify-email`, reqValidatorMiddleware(verifyEmail), this.controller.verifyEmail);
    this.router.post(`${this.path}/verify-phone`, reqValidatorMiddleware(verifyPhoneNo), this.controller.verifyPhoneNo);
    this.router.post(`${this.path}/register`, reqValidatorMiddleware(newUser), this.controller.register);
    this.router.post(`${this.path}/login`, reqValidatorMiddleware(login), this.controller.login);
    this.router.post(`${this.path}/logout`, this.controller.logout);
  }
}

export { AuthRouter };
