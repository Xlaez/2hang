import { configs } from '@/configs';
import { AdminAuthorization } from '@/decorators';
import { createAuthCookie } from '@/services/helpers';
import { sendOtpToUsersMail, sendRegistrationMail } from '@/services/mail/auth';
import { Services } from '@/services/v1';
import { compareAndValidateStrings, generateRandomAlphabets } from '@/utils';
import { newUser } from '@/validations';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  SuccessResponse,
  TryCatchAsyncDec,
} from '@dolphjs/dolph/common';
import { hashWithBcrypt } from '@dolphjs/dolph/utilities';
import { Request, Response } from 'express';

const services = new Services();

export class UserAdminController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @TryCatchAsyncDec
  public async createSuperAdminAccount(req: Request, res: Response) {
    const { password, email, username, display_name } = req.body;

    const user = await services.userService.findByEmail(email);
    const email_taken = 'an account associated with this email already exists, try loging in';

    if (user) return new BadRequestException(email_taken);

    const newUser = await services.userService.create({
      email,
      username,
      display_name,
      password: await hashWithBcrypt({ pureString: password, salt: 12 }),
    });

    if (!newUser) throw new InternalServerErrorException('cannot process request');

    const otp = await newUser.generateOtp();
    await sendOtpToUsersMail(email, otp);

    SuccessResponse({ res, body: { msg: 'otp sent successfully!' } });
  }

  @TryCatchAsyncDec
  public async activateSuperAdminAccount(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.body.email);
    if (!user) throw new BadRequestException('user not found');
    const validateOtp = await compareAndValidateStrings(req.body.otp, user.otp, user.otp_expiry);

    if (!validateOtp) throw new BadRequestException('otp is not valid or has expired, request for another');

    user.otp = '';
    user.otp_expiry = new Date(0);
    user.email_verified = true;
    user.authToken = `1a-${generateRandomAlphabets(53)}`;
    user.role = 'super-admin';

    if (req.body.device_id?.length) user.device_id.push(req.body.device_id);

    if (!(await user.save())) throw new InternalServerErrorException('could not process request');

    await sendRegistrationMail(req.body.email, user.display_name);

    const { options, token } = await createAuthCookie(user._id);
    res.cookie('xAuthToken', token, options);
    SuccessResponse({ res, status: 201, body: { msg: 'account created' } });
  }

  @TryCatchAsyncDec
  @AdminAuthorization(configs.jwt.secret)
  public async getUsersWithMostHangouts(req: Request, res: Response) {
    const { limit, page } = req.query;
    const users = await services.userService.getUsersWithMostHangouts(+limit, +page);
    SuccessResponse({ res, body: users });
  }
}
