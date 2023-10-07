import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
  TryCatchAsyncDec,
} from '@dolphjs/dolph/common';
import { Request, Response } from 'express';
import { Services } from '../services/v1';
import { compareAndValidateStrings, generateRandomAlphabets } from '../utils';
import {
  sendActivateAccountMail,
  sendForogotPasswordMail,
  sendOtpToUsersMail,
  sendRegistrationMail,
} from '../services/mail/auth';
import { createAuthCookie, destroyCookie } from '../services/helpers';
import { hashWithBcrypt } from '@dolphjs/dolph/utilities';
import { Authorization } from '../decorators';
import { configs } from '../configs';
import { sendsms } from '../services/sms';

const services = new Services();

export class AuthController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @TryCatchAsyncDec
  public async sendOtp(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.params.email);
    const email_taken = 'an account associated with this email already exists, try loging in';
    if (user && user.username) return new BadRequestException(email_taken);
    let otp = '';

    /**
     * If user did not complete registration then send activate account mail
     */

    if (user && user.email_verified) {
      otp = await user.generateOtp();
      user.email_verified = false;
      await user.save();

      await sendActivateAccountMail(req.params.email, otp);
    } else {
      if (!user) {
        const newUser = await services.userService.create({ email: req.params.email });
        otp = await newUser.generateOtp();
        await sendOtpToUsersMail(req.params.email, otp);
      } else {
        // user exists but has not activated account
        otp = await user.generateOtp();
        await sendOtpToUsersMail(req.params.email, otp);
      }
    }

    SuccessResponse({ res, body: { msg: 'otp sent successfully!' } });
  }

  @TryCatchAsyncDec
  public async verifyEmail(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.body.email);
    if (!user) throw new BadRequestException('user not found');
    const validateOtp = await compareAndValidateStrings(req.body.otp, user.otp, user.otp_expiry);

    if (!validateOtp) throw new BadRequestException('otp is not valid or has expired, request for another');

    user.otp = '';
    user.otp_expiry = new Date(0);
    user.email_verified = true;

    if (!(await user.save())) throw new InternalServerErrorException('could not process request');

    SuccessResponse({ res, body: { msg: 'emai verified successfully' } });
  }

  @TryCatchAsyncDec
  public async register(req: Request, res: Response) {
    const { email, username, display_name, device_id, gender, password, dob } = req.body;
    const user = await services.userService.findByEmail(email);
    const message = 'email has not been verified, try verifying your email';

    if (!user || !user.email_verified) throw new BadRequestException(message);

    if (user.authToken) throw new BadRequestException('account exists already, try loging in');

    if ((await services.userService.find({ username })).length) throw new BadRequestException('username taken, try another');

    const userData = {
      password: await hashWithBcrypt({ pureString: password, salt: 11 }),
      authToken: `2a-${generateRandomAlphabets(53)}`,
      email,
      username,
      display_name,
      gender,
      dob,
    };

    if (device_id?.length) Object.assign(userData, { device_id: [device_id] });

    if (!(await services.userService.updateByEmail(user.email, userData)))
      throw new InternalServerErrorException('could not process request');

    await sendRegistrationMail(email, display_name);
    const { options, token } = await createAuthCookie(user._id);
    res.cookie('xAuthToken', token, options);
    SuccessResponse({ res, status: 201, body: { msg: 'account created' } });
  }

  @TryCatchAsyncDec
  public async login(req: Request, res: Response) {
    const { username, device_id, password } = req.body;
    /**
     * TODO: implement code to confirm if device_id belongs to user and if not in db already, send token to verify
     */

    const user = await services.userService.findOne({ $or: [{ email: username }, { username }] });
    if (!user) throw new BadRequestException('user does not exist, create an account');

    if (!(await user.doesPasswordMatch(password))) throw new BadRequestException('password does not match username');

    const { options, token } = await createAuthCookie(user._id);

    res.cookie('xAuthToken', token, options);

    SuccessResponse({ res, body: { msg: 'log in successful' } });
  }

  @TryCatchAsyncDec
  public async logout(req: Request, res: Response) {
    const { options } = await destroyCookie();
    res.cookie('xAuthToken', '', options);
    SuccessResponse({ res, body: { msg: 'user has been logged out' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async sendPhoneOtp(req: Request, res: Response) {
    const { phone_no } = req.params;
    const user = await services.userService.findOne({ _id: req.user });
    if (user.phone_no && user.phone_verified) throw new BadRequestException('phone number has already been verified');

    let otp = '';
    if (user.phone_no && !user.phone_verified) {
      otp = await user.generateOtp();
    } else {
      const _user = await services.userService.updateBylD(user._id, { phone_no });
      if (!_user) throw new InternalServerErrorException('cannot process request');

      otp = await user.generateOtp();
    }

    // send otp to phone number
    const sentMail = await sendsms(phone_no, `Dear ${user.display_name}, toHang code: ${otp}. \n Valid for 3 minutes`);
    if (!sentMail.ok) throw new BadRequestException('could not send sms');

    SuccessResponse({ res, body: { msg: 'otp sent' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async verifyPhoneNo(req: Request, res: Response) {
    const { phone_no, otp } = req.body;
    const user = await services.userService.findOne({ phone_no });

    if (!user) throw new BadRequestException('user not found');

    if (!(await compareAndValidateStrings(otp, user.otp, user.otp_expiry)))
      throw new BadRequestException('otp is invalid or has expired. Request for another');

    user.otp = '';
    user.otp_expiry = new Date(0);
    user.phone_verified = true;

    if (!(await user.save())) throw new InternalServerErrorException('cannot proccess request');

    SuccessResponse({ res, body: { msg: 'phone number verified' } });
  }

  @TryCatchAsyncDec
  public async forgotPassword(req: Request, res: Response) {
    const user = await services.userService.findByEmail(req.params.email);
    if (!user) throw new BadRequestException('user not found');

    const otp = await user.generateOtp();

    await sendForogotPasswordMail(req.params.email, otp, user.display_name);

    SuccessResponse({ res, body: { msg: 'otp sent' } });
  }

  @TryCatchAsyncDec
  public async resetPassword(req: Request, res: Response) {
    const { otp, password, email } = req.body;

    const user = await services.userService.findByEmail(email);

    if (!user) throw new BadRequestException('user not found');

    if (!(await compareAndValidateStrings(otp, user.otp, user.otp_expiry)))
      throw new BadRequestException('otp invalid or expired, try requesting another');

    user.otp = '';
    user.otp_expiry = new Date(0);
    user.password = await hashWithBcrypt({ pureString: password, salt: 11 });

    if (!(await user.save())) throw new InternalServerErrorException('cannot process request');

    await services.notificationService.send({
      label: 'Password Updated',
      user: user._id,
      type: 'auth',
      content: `Hello ${user.display_name}! Your password has been update successfully`,
    });

    SuccessResponse({ res, body: { msg: 'password updated' } });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async deleteAccount(req: Request, res: Response) {
    const user = await services.userService.findById(req.user);

    if (!user) throw new NotFoundException('user not found');
    if (!(await user.doesPasswordMatch(req.params.password))) throw new BadRequestException('password is incorrect');

    if (!(await user.remove())) throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: { msg: 'account deleted' } });
  }
}
