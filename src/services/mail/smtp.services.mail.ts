import { configs } from '@/configs';
import { createTransport } from 'nodemailer';

const transport = createTransport({
  service: 'gmail',
  auth: {
    type: 'Login',
    user: configs.smtp.user,
    pass: configs.smtp.pass,
  },
});

export const sendMail = async (subject: string, html: any, receiver: string) => {
  const emailData = {
    from: 'meetpeeps <tech@meetpeeps.xyz>',
    to: receiver,
    subject,
    html,
  };

  return transport.sendMail(emailData);
};
