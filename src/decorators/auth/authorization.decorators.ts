import { sterilizeUserData } from '@/helpers';
import { Services } from '@/services/v1';
import { ErrorException, HttpStatus, NotFoundException, UnauthorizedException } from '@dolphjs/dolph/common';
import { verifyJWTwithHMAC } from '@dolphjs/dolph/utilities';
import { NextFunction, Request, Response } from 'express';

export const Authorization = (tokenSecret: string) => {
  return (_target: any, _propertyKey: string, descriptor?: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;

    descriptor.value = (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = this;

        if (!req.cookies)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const { xAuthToken } = req.cookies;

        if (!xAuthToken)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const payload = verifyJWTwithHMAC({ token: xAuthToken, secret: tokenSecret });

        req.user = payload.sub;

        return originalMethod.apply(context, [req, res, next]);
      } catch (e) {
        throw e;
      }
    };
  };
};

export const SuperAdminAuthorization = (tokenSecret: string) => {
  return (_target: any, _propertyKey: string, descriptor?: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;

    descriptor.value = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = this;

        if (!req.cookies)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const { xAuthToken } = req.cookies;

        if (!xAuthToken)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const payload = verifyJWTwithHMAC({ token: xAuthToken, secret: tokenSecret });

        const user = await new Services().userService.findById(payload.sub);

        if (!user) throw new NotFoundException('this user does not exist');

        if (user.role !== 'super-admin') throw new UnauthorizedException('only a super admin can make the request');

        req.user = sterilizeUserData(user);

        return originalMethod.apply(context, [req, res, next]);
      } catch (e) {
        throw e;
      }
    };
  };
};

export const AdminAuthorization = (tokenSecret: string) => {
  return (_target: any, _propertyKey: string, descriptor?: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;

    descriptor.value = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = this;

        if (!req.cookies)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const { xAuthToken } = req.cookies;

        if (!xAuthToken)
          return next(new ErrorException(HttpStatus.UNAUTHORIZED, 'user not authorized, login and try again'));

        const payload = verifyJWTwithHMAC({ token: xAuthToken, secret: tokenSecret });

        const user = await new Services().userService.findById(payload.sub);

        if (!user) throw new NotFoundException('this user does not exist');

        if (user.role === 'user') throw new UnauthorizedException('only a super admin or admin can make the request');

        req.user = sterilizeUserData(user);

        return originalMethod.apply(context, [req, res, next]);
      } catch (e) {
        throw e;
      }
    };
  };
};
