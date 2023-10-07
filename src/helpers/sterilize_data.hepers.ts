import { IUser } from '../models';

export const sterilizeUserData = (user: IUser) => {
  if (!user) return {};

  const {
    id,
    socials,
    location,
    username,
    phone_no,
    phone_verified,
    email,
    email_verified,
    profile_img,
    device_id,
    dob,
    account_disabled,
    status,
    display_name,
  } = user;
  return {
    id,
    username: `@${username}`,
    email,
    email_verified,
    display_name,
    phone_no,
    phone_verified,
    dob,
    profile_img,
    status,
    device_id,
    location,
    socials,
    account_disabled,
  };
};
