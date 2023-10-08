import { mongoose } from '@dolphjs/dolph/packages';
import { transformDoc } from '@dolphjs/dolph/packages';

import { users } from './constants';
import paginate = require('mongoose-paginate-v2');

import { IUser } from './interfaces';
import { generateRandomNumbers } from '../utils';
import { compareWithBcryptHash, hashWithArgon, hashWithBcrypt, verifyArgonHash } from '@dolphjs/dolph/utilities';
import { NextFunction } from 'express';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
    },
    display_name: {
      type: String,
      required: false,
      lowercase: true,
    },
    dob: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone_no: {
      type: String,
      trim: true,
    },
    profile_img: {
      type: String,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    otp: {
      type: String,
    },
    otp_expiry: {
      type: Date,
    },
    account_disabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['offline', 'online', 'busy'],
      default: 'offline',
    },
    device_id: [{ type: String }],
    interests: [{ type: String }],
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    hangouts: {
      type: Number,
      default: 0,
    },
    hangout_req: {
      type: Number,
      default: 0,
    },
    sent_hangout_req: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'none'],
    },
    location: {
      state: {
        type: String,
      },
      country: {
        type: String,
      },
    },
    socials: {
      twitter: {
        type: String,
      },
      facebook: {
        type: String,
      },
    },
    authType: {
      type: String,
      enum: ['login', 'gmail'],
      default: 'login',
    },
    authToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: users,
  },
);

UserSchema.plugin(transformDoc);
UserSchema.plugin(paginate);

UserSchema.methods.generateOtp = async function () {
  const user = this as IUser;
  const otp = generateRandomNumbers(0, 10, 5);
  user.otp = (await hashWithBcrypt({ pureString: otp, salt: 11 })).toString();
  user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();
  return otp;
};

UserSchema.methods.doesPasswordMatch = async function (password: string): Promise<boolean> {
  const user = this as IUser;
  return compareWithBcryptHash({ pureString: password, hashString: user.password });
};

export const UserModel: mongoose.PaginateModel<IUser> = mongoose.model<IUser, mongoose.PaginateModel<IUser>>(
  users,
  UserSchema,
);
