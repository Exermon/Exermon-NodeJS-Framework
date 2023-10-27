import {config} from "../../config/ConfigManager";

export type RawSequelizeConfig = {
  host: string
  port: number
  username: string
  password: string
  database: string
  timezone?: string
}

export type SequelizeConfig = {
  multiple?: true, default?: RawSequelizeConfig
} & Partial<RawSequelizeConfig> // & {[K in string]?: RawSequelizeConfig})

declare module "../../config/ConfigType" {
  interface MainConfig {
    sequelize?: SequelizeConfig
  }
}

export default function() { return config().sequelize }
