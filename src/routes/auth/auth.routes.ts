import { DolphControllerHandler, DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';

class AuthRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }
  controller: DolphControllerHandler<string>;

  path: string = '/v1/auth';
  initRoutes(): void {
    this.router.get(this.path, (req, res) => {
      res.send('reached here');
    });
  }
}

export { AuthRouter };
