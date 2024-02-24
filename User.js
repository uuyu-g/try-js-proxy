import { ActiveRecordBase } from './main.js';
import { Post } from './Post.js';

export class User extends ActiveRecordBase {}

User.hasMany('posts', { model: Post });
