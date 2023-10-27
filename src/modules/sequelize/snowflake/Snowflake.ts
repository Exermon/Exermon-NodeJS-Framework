import SnowflakeId from "snowflake-id";
import {ModelStatic} from "sequelize-typescript";
import {BeforeCreate} from "sequelize-typescript/dist/hooks/single/before/before-create";

export const snowflake = new SnowflakeId({custom_epoch: 1658291243929, instance_id: 1});

export function snowflakeModel(idKeyOrClazz: string | ModelStatic) {
  if (idKeyOrClazz instanceof Function) // 如果传入的是ModelStatic
    return snowflakeModel("id")(idKeyOrClazz);

  return clazz => {
    clazz["setSnowflake"] = function (instance) {
      instance[idKeyOrClazz || "id"] = snowflake.generate();
      console.log("BeforeCreate", clazz, instance);
    };
    BeforeCreate(clazz, "setSnowflake");
  }
}
