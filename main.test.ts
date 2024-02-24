import { assertEquals } from 'https://deno.land/std@0.217.0/assert/assert_equals.ts';
import { User } from './User.ts';
import { ActiveRecordBase } from './main.ts';

Deno.test('User create', async () => {
  const user = await User.create({ id: 1, name: 'Taro' });
  assertEquals(user.id, 1);
  assertEquals(user.name, 'Taro');
  assertEquals(User.findAll().length, 1);

  ActiveRecordBase.reset();
});

Deno.test('User hasMany Post', async () => {
  const user = await User.create({ id: 1, name: 'Taro' });
  await user.posts.create({ desc: 'Hogehoge' });
  await user.posts.create({ desc: 'fugauga' });

  assertEquals(user.posts.all().length, 2);
  assertEquals(user.posts.all()[0].desc, 'Hogehoge');

  ActiveRecordBase.reset();
});

Deno.test('Post belongsTo User', async () => {
  const user = await User.create({ id: 1, name: 'Taro' });
  const post = await user.posts.create({ desc: 'Hogehoge' });

  assertEquals(post.user, user);

  ActiveRecordBase.reset();
});

Deno.test('Post hasMany Comment', async () => {
  const user = await User.create({ id: 1, name: 'Taro' });
  const post = await user.posts.create({ desc: 'Hogehoge' });
  await post.comments.create({ desc: 'fugauga' });
  await post.comments.create({ desc: 'piyopiyo' });

  assertEquals(post.comments.all().length, 2);
  assertEquals(post.comments.all()[0].desc, 'fugauga');

  ActiveRecordBase.reset();
});
