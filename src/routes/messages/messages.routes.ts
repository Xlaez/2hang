import { DolphControllerHandler, DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';

export class MessageRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }

  path: string = '/v1/messages';
  controller: DolphControllerHandler<string>;

  initRoutes(): void {
    this.router.post(`${this.path}`);
  }
}
