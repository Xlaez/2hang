import { InjectServiceHandler } from '@dolphjs/dolph/decorators';
import { UserService } from './user/user.services.v1';
import { NotificationService } from './notification.services.v1';
import { PostService } from './posts/posts.services.v1';

const services = [
  { serviceHandler: UserService, serviceName: 'userService' },
  { serviceHandler: NotificationService, serviceName: 'notificationService' },
  { serviceHandler: PostService, serviceName: 'postService' },
];

@InjectServiceHandler(services)
export class Services {
  userService!: UserService;
  postService!: PostService;
  notificationService!: NotificationService;
}
