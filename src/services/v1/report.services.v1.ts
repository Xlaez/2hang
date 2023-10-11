import { IReport, ReportModel } from '@/models';
import { DolphServiceHandler } from '@dolphjs/dolph/classes';
import { Dolph } from '@dolphjs/dolph/common';
import { InjectMongo } from '@dolphjs/dolph/decorators';
import { mongoose } from '@dolphjs/dolph/packages';

@InjectMongo('reportModel', ReportModel)
export class ReportService extends DolphServiceHandler<Dolph> {
  reportModel!: mongoose.Model<IReport, mongoose.PaginateModel<IReport>>;
  constructor() {
    super('report');
  }

  public readonly new = async (body: any) => {
    return this.reportModel.create(body);
  };

  public readonly getById = async (id: string) => {
    return this.reportModel.findById(id).lean();
  };
}
