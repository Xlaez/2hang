import { configs } from '@/src/configs';

export const sendsms = async (receiver: string, message: string) => {
  try {
    return fetch('https://api.sendchamp.com/api/v1/sms/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${configs.sms.sendchamp_api}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [receiver],
        message,
        sender_name: 'Sendchamp',
        route: 'non_dnd',
      }),
    });
  } catch (error) {
    throw error;
  }
};
