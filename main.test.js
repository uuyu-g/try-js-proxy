import { assertEquals } from 'https://deno.land/std@0.217.0/assert/assert_equals.ts';
import { User } from './User.js';
import { ActiveRecordBase } from './main.js';

Deno.test('User create', async () => {
  const user = new User({ id: 1, name: 'Taro' });
  await user.save();
  assertEquals(user.id, 1);
  assertEquals(user.name, 'Taro');
  assertEquals(User.findAll().length, 1);

  ActiveRecordBase.reset();
});

Deno.test('User hasMany Post', async () => {
  const user = new User({ id: 1, name: 'Taro' });
  await user.save();
  await user.posts.create({ desc: 'Hogehoge' });
  await user.posts.create({ desc: 'fugauga' });

  assertEquals(user.posts.all().length, 2);
  assertEquals(user.posts.all()[0].desc, 'Hogehoge');

  ActiveRecordBase.reset();
});

Deno.test('Post belongsTo User', async () => {
  const user = new User({ id: 1, name: 'Taro' });
  await user.save();
  const post = await user.posts.create({ desc: 'Hogehoge' });

  assertEquals(post.user, user);

  ActiveRecordBase.reset();
});

Deno.test('Post hasMany Comment', async () => {
  const user = new User({ id: 1, name: 'Taro' });
  await user.save();
  const post = await user.posts.create({ desc: 'Hogehoge' });
  await post.comments.create({ desc: 'fugauga' });
  await post.comments.create({ desc: 'piyopiyo' });

  assertEquals(post.comments.all().length, 2);
  assertEquals(post.comments.all()[0].desc, 'fugauga');

  ActiveRecordBase.reset();
});
