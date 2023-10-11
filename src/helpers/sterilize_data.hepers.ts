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
    hangouts,
    hangout_req,
    interests,
    sent_hangout_req,
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
    hangouts,
    hangout_req,
    sent_hangout_req,
    profile_img,
    status,
    device_id,
    interests,
    location,
    socials,
    account_disabled,
  };
};

export const sterilizeMultipleUserData = (users: IUser[]) => {
  let usersData: IUser[] = [];
  users.map((user) => {
    //@ts-expect-error
    usersData.push(sterilizeUserData(user));
  });
  return usersData;
};

export const minifyUserData = (user: IUser) => {
  if (!user) return {};

  const { id, username, profile_img, account_disabled, status, display_name, interests } = user;
  return {
    id,
    username: `@${username}`,
    profile_img,
    status,
    interests,
    account_disabled,
    display_name,
  };
};
