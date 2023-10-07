import { ErrorException, HttpStatus } from '@dolphjs/dolph/common';
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
