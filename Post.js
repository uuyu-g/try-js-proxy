import { Comment } from './Comment.js';
import { ActiveRecordBase } from './main.js';

export class Post extends ActiveRecordBase {}

Post.hasMany('comments', { model: Comment });
