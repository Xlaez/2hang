import { MessageController } from '@/controllers/messages/messages.controller';
import { getMessagesByHangoutId, newMessage } from '@/validations';
import { DolphControllerHandler, DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';

export class MessageRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }

  path: string = '/v1/messages';
  controller: MessageController = new MessageController();

  initRoutes(): void {
    this.router.get(
      `${this.path}/:hangout_id`,
      reqValidatorMiddleware(getMessagesByHangoutId),
      this.controller.getMessagesForHangout,
    );

    this.router.put(
      `${this.path}/mark-read/:hangout_id`,
      reqValidatorMiddleware(getMessagesByHangoutId),
      this.controller.markMessageRead,
    );

    this.router.post(`${this.path}`, reqValidatorMiddleware(newMessage), this.controller.sendMessage);
  }
}
