class ActiveRecordBase {
  static dataStore = {};
  static relations = {};

  static hasMany(relationName, { model }) {
    this.relations[relationName] = { type: 'hasMany', model };
  }

  static async create(attributes) {
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  static findAll() {
    return this.dataStore[this.name] || [];
  }

  constructor(attributes) {
    this.attributes = attributes;
    this.constructor.dataStore[this.constructor.name] =
      this.constructor.dataStore[this.constructor.name] || [];
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return target[prop];
        } else if (prop in target.constructor.relations) {
          const relation = target.constructor.relations[prop];
          if (relation.type === 'hasMany') {
            return {
              create: async (relatedAttributes) => {
                const relatedInstance = new relation.model({
                  ...relatedAttributes,
                  [`${target.constructor.name.toLowerCase()}Id`]: target.attributes.id,
                });
                await relatedInstance.save();
                return relatedInstance;
              },
              all: () => {
                return relation.model
                  .findAll()
                  .filter(
                    (relatedInstance) =>
                      relatedInstance.attributes[`${target.constructor.name.toLowerCase()}Id`] ===
                      target.attributes.id,
                  );
              },
            };
          }
        }
      },
    });
  }

  async save() {
    this.constructor.dataStore[this.constructor.name].push(this);
    console.log(`${this.constructor.name} saved.`);
  }

  async delete() {
    const index = this.constructor.dataStore[this.constructor.name].indexOf(this);
    if (index !== -1) {
      this.constructor.dataStore[this.constructor.name].splice(index, 1);
      console.log(`${this.constructor.name} deleted.`);
    }
  }
}

class Post extends ActiveRecordBase {}
class User extends ActiveRecordBase {}

User.hasMany('posts', { model: Post });

const user = new User({ id: 1, name: 'Taro' });
await user.save();

const post = await user.posts.create({ desc: 'Hogehoge' });
console.log(post);
console.log(user.posts.all());
