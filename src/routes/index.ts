import { AuthRouter } from './auth/auth.routes';
import { PostRouter } from './posts/posts.routes';
import { UserRouter } from './user/user.routes';

const routes = [new AuthRouter(), new UserRouter(), new PostRouter()];
export default routes;
