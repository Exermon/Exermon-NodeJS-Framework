import {Column, DataType, Model} from "sequelize-typescript";
import {
  Model as Model_,
  ModelStatic,
  DestroyOptions,
  FindOptions,
  UpdateOptions,
  CountOptions,
  Attributes,
  CountWithOptions,
  GroupedCountResultItem,
  CreateOptions,
  CreationAttributes,
  FindOrCreateOptions
} from "sequelize/types/model";
import {Col, Fn, Literal} from "sequelize/types/utils";
import {TextLength} from "sequelize/types/data-types";

export function DateTimeColumn(obj, key) {
  return Column({
    type: DataType.DATE,
    get(this) { return (new Date(this.getDataValue(key))).getTime() }
  })(obj, key)
}

export function JSONColumn<T = any>(
  objOrLength: TextLength | object,
  keyOrGetWrapper?: ((res: T | any) => T) | string,
  setWrapper?: ((res: T) => T | any)) {
  const flag = typeof objOrLength == "string" ||
    keyOrGetWrapper instanceof Function;

  const length = (flag && objOrLength) as TextLength;
  const getWrapper = flag && keyOrGetWrapper as (res: T | any) => T;
  const obj = !flag && objOrLength;
  const key = !flag && keyOrGetWrapper;

  const process = (obj, key) => Column({
    type: DataType.TEXT(length),
    set(this, val: T) {
      val = setWrapper ? setWrapper(val) : val;
      this.setDataValue(key, JSON.stringify(val))
    },
    get(this): T {
      let str, res: T;
      try {
        str = this.getDataValue(key);
        res = JSON.parse(str);
      } catch (e) {
        console.error(`JSON Field: "${key}" error!`, str, e)
      }
      return getWrapper ? getWrapper(res) : res;
    }
  })(obj, key)

  return flag ? process : process(obj, key);
}

export function EnumColumn(enumClass: Record<string, string>) {
  return Column(DataType.ENUM(...Object.values(enumClass)))
}

export enum Order {
  DESC = "DESC",
  ASC = "ASC",
  NULL_FIRST = "NULLS FIRST"
}

export abstract class BaseModel extends Model {

  public static create<
    M extends Model_,
    O extends CreateOptions<Attributes<M>> = CreateOptions<M>
    >(
    this: ModelStatic<M>,
    values?: Partial<M>,
    options?: O
  ): Promise<O extends { returning: false } | { ignoreDuplicates: true } ? void : M> {
    return Model.create<M, O>.call(this, values, options);
  }

  public static findAll<M extends Model_> (
    this: ModelStatic<M>,
    options?: FindOptions<M>): Promise<M[]> {
    return Model.findAll<M>.call(this, options);
  }

  public static findOne<M extends Model_> (
    this: ModelStatic<M>,
    options?: FindOptions<M>): Promise<M> {
    return Model.findOne<M>.call(this, options);
  }

  public static findOrCreate<M extends Model_>(
    this: ModelStatic<M>,
    options: FindOrCreateOptions<M, CreationAttributes<M>>
  ): Promise<[M, boolean]> {
    return Model.findOrCreate<M>.call(this, options);
  }

  public static count<M extends Model_> (
    this: ModelStatic<M>,
    options?: Omit<CountOptions<M>, 'group'>):
    Promise<number>
  public static count<M extends Model_> (
    this: ModelStatic<M>,
    options?: CountWithOptions<M>):
    Promise<GroupedCountResultItem[]>
  public static count<M extends Model_> (
    this: ModelStatic<M>,
    options?: CountWithOptions<M> | Omit<CountOptions<M>, 'group'>):
    Promise<GroupedCountResultItem[]> | Promise<number>{
    return Model.count<M>.call(this, options);
  }

  public static destroy<M extends Model_> (
    this: ModelStatic<M>,
    options?: DestroyOptions<M>): Promise<number> {
    return Model.destroy<M>.call(this, options);
  }

  public static update<M extends Model_>(
    this: ModelStatic<M>,
    values: {
      [key in keyof M]?: M[key] | Fn | Col | Literal;
    },
    options: (Omit<UpdateOptions<M>, 'returning'>
      & { returning: Exclude<UpdateOptions<M>['returning'], undefined | false>})
  ): Promise<[affectedCount: number, affectedRows: M[]]>;
  public static update<M extends Model_>(
    this: ModelStatic<M>,
    values: {
      [key in keyof M]?: M[key] | Fn | Col | Literal;
    },
    options: UpdateOptions<M>
  ): Promise<[affectedCount: number]>;
  public static update<M extends Model_>(
    this: ModelStatic<M>,
    values: {
      [key in keyof M]?: M[key] | Fn | Col | Literal;
    },
    options: (Omit<UpdateOptions<M>, 'returning'>
      & { returning: Exclude<UpdateOptions<M>['returning'], undefined | false>}) | UpdateOptions<M>
  ): Promise<[affectedCount: number, affectedRows: M[]]> | Promise<[affectedCount: number]> {
    return Model.update<M>.call(this, values, options);
  }

}
export function asyncProject<T extends BaseModel>(...keys: (keyof T)[]) {
  return (obj: T, key: string, desc) => {
    const oriFunc = desc.value;
    desc.value = async function (...p) {
      const res = await oriFunc.call(this, ...p) || {};
      keys.forEach(k => res[k] = this[k]);
      return res
    }
  }
}
