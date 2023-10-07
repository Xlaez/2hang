import { sendForogtPasswordMailTemplate } from '../convert_from_mjml_to_html.services.mail';
import { sendMail } from '../smtp.services.mail';

export const sendForogotPasswordMail = async (receiver: string, otp: string, displayname: string) => {
  const subject = 'Reset Password';
  await sendMail(subject, sendForogtPasswordMailTemplate({ otp, displayname }), receiver);
};
