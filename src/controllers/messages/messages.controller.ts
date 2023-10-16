import { configs } from '@/configs';
import { messageExtensions } from '@/constants';
import { Authorization } from '@/decorators';
import { uploadOneToCloud } from '@/services/helpers';
import { Services } from '@/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotFoundException,
  SuccessResponse,
  TryCatchAsyncDec,
  pick,
} from '@dolphjs/dolph/common';
import { MediaParser } from '@dolphjs/dolph/utilities';
import { Request, Response } from 'express';

const services = new Services();

export class MessageController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  @MediaParser({ fieldname: 'upload', type: 'single', extensions: messageExtensions })
  public async sendMessage(req: Request, res: Response) {
    //@ts-expect-error
    const { user, file, body } = req;

    let msg = { hangout_id: body.hangout_id, sender: user.toString(), read_by: [{ user }] };

    if (body.text && file) {
      const url = await uploadOneToCloud(file.path);
      Object.assign(msg, { message: { text: body.text, file: url } });
    } else if (body.text) {
      Object.assign(msg, { message: { text: body.text } });
    } else if (file) {
      const url = await uploadOneToCloud(file.path);
      Object.assign(msg, { message: { file: url } });
    } else {
      throw new BadRequestException('please send a valid text');
    }

    const message = await services.messageService.newMessage(msg);

    SuccessResponse({ res, status: 201, body: message });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async getMessagesForHangout(req: Request, res: Response) {
    const filter = pick(req.params, ['hangout_id']);
    const options = pick(req.query, ['limit', 'page']);
    const messages = await services.messageService.getMessagesByHangoutId(filter, options);
    if (!messages) throw new NotFoundException('there is no messages in this hangout');
    SuccessResponse({ res, body: messages });
  }

  @TryCatchAsyncDec
  @Authorization(configs.jwt.secret)
  public async markMessageRead(req: Request, res: Response) {
    const msg = await services.messageService.markMessageAsRead(req.params.hangout_id, req.user.toString());
    if (!msg) throw new InternalServerErrorException('cannot process request');
    SuccessResponse({ res, body: { msg: 'updated' } });
  }
}
