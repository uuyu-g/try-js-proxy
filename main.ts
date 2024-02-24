type Attributes = Record<string, any>;

export class ActiveRecordBase<T extends Attributes> {
  static dataStore: Record<string, any[]> = {};
  static relations: Record<string, { type: string; model: typeof ActiveRecordBase }> = {};

  static hasMany<R extends ActiveRecordBase<any>>(
    relationName: string,
    { model }: { model: new (attributes: any) => R },
  ) {
    this.relations[relationName] = { type: 'hasMany', model };
    (model as any).relations[this.name.toLowerCase()] = { type: 'belongsTo', model: this };
  }

  static async create<R extends ActiveRecordBase<any>>(
    this: new (attributes: any) => R,
    attributes: Attributes,
  ): Promise<R> {
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  static findAll<R extends ActiveRecordBase<any>>(this: new (attributes: any) => R): R[] {
    return (this.dataStore[this.name] || []) as R[];
  }

  static reset() {
    this.dataStore = {};
  }

  attributes: T;

  constructor(attributes: T) {
    this.attributes = attributes;
    this.constructor.dataStore[this.constructor.name] =
      this.constructor.dataStore[this.constructor.name] || [];
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return target[prop as keyof ActiveRecordBase<T>];
        }
        if (prop in target.attributes) {
          return target.attributes[prop as keyof T];
        }
        const relation = target.constructor.relations[prop as string];
        if (relation) {
          if (relation.type === 'hasMany') {
            const relatedModel = relation.model as typeof ActiveRecordBase;
            return {
              create: async (relatedAttributes: Attributes) => {
                const relatedInstance = new relatedModel({
                  ...relatedAttributes,
                  [`${target.constructor.name.toLowerCase()}Id`]: target.attributes.id,
                });
                await relatedInstance.save();
                return relatedInstance;
              },
              all: () => {
                return relatedModel
                  .findAll()
                  .filter(
                    (relatedInstance: ActiveRecordBase<any>) =>
                      relatedInstance.attributes[`${target.constructor.name.toLowerCase()}Id`] ===
                      target.attributes.id,
                  ) as ActiveRecordBase<any>[];
              },
            };
          }
          if (relation.type === 'belongsTo') {
            const relatedModel = relation.model as typeof ActiveRecordBase;
            return relatedModel
              .findAll()
              .find(
                (relatedInstance: ActiveRecordBase<any>) =>
                  relatedInstance.attributes.id ===
                  target.attributes[`${relatedModel.name.toLowerCase()}Id`],
              );
          }
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as T & ActiveRecordBase<T>;
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
