import { AuthRouter } from './auth/auth.routes';
import { MessageRouter } from './messages/messages.routes';
import { PostRouter } from './posts/posts.routes';
import { ReportRouter } from './reports/reports.routes';
import { UserRouter } from './user/user.routes';

const routes = [new AuthRouter(), new UserRouter(), new PostRouter(), new MessageRouter(), new ReportRouter()];
export default routes;
