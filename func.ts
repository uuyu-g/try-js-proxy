class ActiveRecordBase {
  async save(): Promise<void> {
    // 保存ロジック
    console.log('Saving...');
  }

  async delete(): Promise<void> {
    // 削除ロジック
    console.log('Deleting...');
  }
}

type  T & ActiveRecordBase;

function createActiveRecord<T>(model: T): T & ActiveRecordBase {
  const base = new ActiveRecordBase();
  return new Proxy(model as T & ActiveRecordBase, {
    get(target, prop, receiver) {
      if (prop in base) {
        return (base as any)[prop].bind(target);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

interface User {
  id: number;
  name: string;
  email: string;
}

const user = createActiveRecord<User>({ id: 1, name: 'John Doe', email: 'john.doe@example.com' });

// `save`と`delete`メソッドを直接呼び出すことができます。
user.save();
user.delete();
