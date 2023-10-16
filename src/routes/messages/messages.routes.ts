import { MessageController } from '@/controllers/messages/messages.controller';
import { newMessage } from '@/validations';
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
    this.router.post(`${this.path}`, reqValidatorMiddleware(newMessage), this.controller.sendMessage);
  }
}
