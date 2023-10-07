import { AuthRouter } from './auth/auth.routes';
import { UserRouter } from './user/user.routes';

const routes = [new AuthRouter(), new UserRouter()];
export default routes;
