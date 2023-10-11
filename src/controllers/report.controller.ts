import { Services } from '@/services/v1';
import { DolphControllerHandler } from '@dolphjs/dolph/classes';
import { Dolph, InternalServerErrorException, SuccessResponse } from '@dolphjs/dolph/common';
import { Request, Response } from 'express';

const services = new Services();

export class ReportController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  public async newReport(req: Request, res: Response) {
    if (!(await services.reportService.new({ ...req.body, reporter_id: req.user })))
      throw new InternalServerErrorException('cannot process request');

    SuccessResponse({ res, body: { msg: 'user has een reported to admins' } });
  }
}
