import { ActiveRecordBase } from './main.js';
import { Post } from './Post.js';

export type UserModel = {
  id: number;
  name: string;
};

export class User extends ActiveRecordBase<UserModel> {}

User.hasMany('posts', { model: Post });
