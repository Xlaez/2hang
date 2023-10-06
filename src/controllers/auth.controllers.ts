import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import { BadRequestException, Dolph, SuccessResponse } from '@dolphjs/dolph/common';
import { Request, Response } from 'express';
import { Services } from '../services/v1';

const services = new Services();

export class AuthController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  public async sendOtp(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.params.email);
    const email_taken = 'an account associated with this email already exists, try loging in';
    if (user && user.username) return new BadRequestException(email_taken);
    let otp = '';

    /**
     * If use did not complete registration
     */

    if (user && user.email_verified) {
      otp = await user.generateOtp();
      user.email_verified = false;
      await user.save();

      //send activate account email
    } else {
      if (!user) {
        const newUser = await services.userService.create({ email: req.params.email });
        otp = await newUser.generateOtp();
        // send mail with otp
      } else {
        // user exists but has not activated account
        otp = await user.generateOtp();
        // send mail with otp
      }
    }

    SuccessResponse({ res, msg: 'otp sent successfully!' });
  }

  public async register(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.params.email);
    const message = 'an account associated with this email already exists';
    if (user) return new BadRequestException(message);
  }
}
