import { DolphFactory } from '@dolphjs/dolph';
import routes from './routes';
import { mongoose } from '@dolphjs/dolph/packages';

mongoose
  .connect('mongodb://localhost:27017/2hang', { autoIndex: true })
  .then((res) => {})
  .catch((err) => {
    console.log(err);
  });
const dolph = new DolphFactory(routes);
dolph.start();
