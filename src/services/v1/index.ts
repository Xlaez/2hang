import { InjectServiceHandler } from '@dolphjs/dolph/decorators';
import { UserService } from './user/user.services.v1';

@InjectServiceHandler([{ serviceHandler: UserService, serviceName: 'userService' }])
export class Services {
  userService!: UserService;
}
