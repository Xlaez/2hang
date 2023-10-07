import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { resolve } from 'path';
import mjml2html = require('mjml');

const sendOtpMail = readFileSync(resolve(__dirname, './templates/auth/send_otp.templates.mjml')).toString();
const sendAvtivateAccountMail = readFileSync(
  resolve(__dirname, './templates/auth/activate_account.templates.mjml'),
).toString();
const sendRegistrationSuccessfulMail = readFileSync(
  resolve(__dirname, './templates/auth/registration_successful.template.mjml'),
).toString();

export const sendOtpMailTemplate = compile(mjml2html(sendOtpMail).html);
export const sendAvtivateAccountMailTemplate = compile(mjml2html(sendAvtivateAccountMail).html);
export const sendRegistrationSuccessfulMailTemplate = compile(mjml2html(sendRegistrationSuccessfulMail).html);
