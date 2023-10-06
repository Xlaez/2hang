import { Document } from 'mongoose';
import { authType, role, status } from '../types';

export interface UserLocation {
  state: string;
  country: string;
}

export interface UserSocials {
  twitter: string;
  facebook: string;
}

export interface IUser extends Document {
  username: string;
  display_name: string;
  dob: Date;
  email: string;
  phone_no: string;
  profile_img: string;
  password: string;
  role: role;
  otp: string;
  otp_expiry: Date;
  account_disabled: boolean;
  status: status;
  device_id: string[];
  email_verified: boolean;
  phone_verified: boolean;
  gender: string;
  location: UserLocation;
  socials: UserSocials;
  createdAt: Date;
  updatedAt: Date;
  authType: authType;
  authToken: string;
  generateOtp: () => Promise<string>;
  doesPasswordMatch: (password: string) => Promise<boolean>;
}
