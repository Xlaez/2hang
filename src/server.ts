import { DolphFactory } from '@dolphjs/dolph';
import routes from './routes';

const dolph = new DolphFactory(routes);
dolph.start();
