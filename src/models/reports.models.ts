import { mongoose } from '@dolphjs/dolph/packages';
import { reports, users } from './constants';
import { IReport } from './interfaces/reports.models.interfaces';

const ReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['abuse', 'hacked-account', 'impersonation', 'threat', 'other'],
    },
    details: {
      type: String,
      required: false,
    },
    reporter_id: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
    reported_id: {
      type: mongoose.Types.ObjectId,
      ref: users,
    },
  },
  { timestamps: true },
);

export const ReportModel = mongoose.model<IReport, mongoose.PaginateModel<IReport>>(reports, ReportSchema);
