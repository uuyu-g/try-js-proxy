import { Comment } from './Comment.js';
import { ActiveRecordBase } from './main.ts';

export class Post extends ActiveRecordBase {}

Post.hasMany('comments', { model: Comment });
