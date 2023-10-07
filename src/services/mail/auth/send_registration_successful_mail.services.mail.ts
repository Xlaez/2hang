import { sendRegistrationSuccessfulMailTemplate } from '../convert_from_mjml_to_html.services.mail';
import { sendMail } from '../smtp.services.mail';

export const sendRegistrationMail = async (receiver: string, displayname: string) => {
  const subject = '2geda Account Created';
  await sendMail(subject, sendRegistrationSuccessfulMailTemplate({ displayname }), receiver);
};
