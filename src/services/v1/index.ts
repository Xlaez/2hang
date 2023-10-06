import { InjectServiceHandler } from '@dolphjs/dolph/decorators';
import { UserService } from './user/user.services.v1';
import { NotificationService } from './notification.services.v1';

const services = [
  { serviceHandler: UserService, serviceName: 'userService' },
  { serviceHandler: NotificationService, serviceName: 'notificationService' },
];

@InjectServiceHandler(services)
export class Services {
  userService!: UserService;
  notificationService!: NotificationService;
}
