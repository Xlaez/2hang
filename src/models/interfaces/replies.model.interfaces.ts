import { mongoose } from '@dolphjs/dolph/packages';
import { IUser } from './user.model.interfaces';
import { IPost } from './post.model.interfaces';
import { ILike } from './like.model.interface.';

export interface IReply extends mongoose.Document {
  owner: IUser['_id'];
  text: string;
  parent_id: IReply['_id'];
  post_id: IPost['_id'];
  nb_children: number;
  nb_likes: number;
  likes: ILike[];
  is_child: boolean;
}
