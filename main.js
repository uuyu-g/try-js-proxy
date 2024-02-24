export class ActiveRecordBase {
  static dataStore = {};
  static relations = {};

  static hasMany(relationName, { model }) {
    this.relations[relationName] = { type: 'hasMany', model };
    model.relations[this.name.toLowerCase()] = { type: 'belongsTo', model: this };
  }

  static async create(attributes) {
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  static findAll() {
    return this.dataStore[this.name] || [];
  }

  static reset() {
    this.dataStore = {};
  }

  constructor(attributes) {
    this.attributes = attributes;
    this.constructor.dataStore[this.constructor.name] =
      this.constructor.dataStore[this.constructor.name] || [];
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return target[prop];
        }
        if (prop in target.attributes) {
          return target.attributes[prop];
        }
        if (prop in target.constructor.relations) {
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
          if (relation.type === 'belongsTo') {
            return relation.model
              .findAll()
              .find(
                (relatedInstance) =>
                  relatedInstance.attributes.id ===
                  target.attributes[`${relation.model.name.toLowerCase()}Id`],
              );
          }
        }
      },
    });
  }

  async save() {
    this.constructor.dataStore[this.constructor.name].push(this);
    console.log(`${this.constructor.name} saved. : ${JSON.stringify(this.attributes)}`);
  }

  async delete() {
    const index = this.constructor.dataStore[this.constructor.name].indexOf(this);
    if (index !== -1) {
      this.constructor.dataStore[this.constructor.name].splice(index, 1);
      console.log(`${this.constructor.name} deleted.`);
    }
  }
}
