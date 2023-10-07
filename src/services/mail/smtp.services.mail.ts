import { configs } from '@/src/configs';
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
    from: '2hang <tech@2hang.xyz>',
    to: receiver,
    subject,
    html,
  };

  return transport.sendMail(emailData);
};
