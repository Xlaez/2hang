import { InjectServiceHandler } from '@dolphjs/dolph/decorators';
import { UserService } from './user/user.services.v1';
import { NotificationService } from './notification.services.v1';
import { PostService } from './posts/posts.services.v1';
import { ReportService } from './report.services.v1';
import { MessageService } from './messages.services.v1';

const services = [
  { serviceHandler: UserService, serviceName: 'userService' },
  { serviceHandler: MessageService, serviceName: 'messageService' },
  { serviceHandler: NotificationService, serviceName: 'notificationService' },
  { serviceHandler: PostService, serviceName: 'postService' },
  { serviceHandler: ReportService, serviceName: 'reportService' },
];

@InjectServiceHandler(services)
export class Services {
  userService!: UserService;
  postService!: PostService;
  notificationService!: NotificationService;
  reportService!: ReportService;
  messageService!: MessageService;
}
