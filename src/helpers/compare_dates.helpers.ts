import moment = require('moment');

export const isTimeFrameMoreThanThreeDays = (date: Date) => {
  const today = moment().format('YYYY-MM-DD hh:mm:ss');
  const postDate = moment(date).format('YYYY-MM-DD hh:mm:ss');
  return false;
};
