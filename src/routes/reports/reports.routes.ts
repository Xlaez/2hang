import { ReportController } from '@/controllers/report.controller';
import { newReport } from '@/validations';
import { DolphRouteHandler } from '@dolphjs/dolph/classes';
import { Dolph, reqValidatorMiddleware } from '@dolphjs/dolph/common';

export class ReportRouter extends DolphRouteHandler<Dolph> {
  constructor() {
    super();
    this.initRoutes();
  }

  controller: ReportController = new ReportController();

  path: string = '/v1/reports';

  initRoutes(): void {
    this.router.post(`${this.path}`, reqValidatorMiddleware(newReport), this.controller.newReport);
  }
}
