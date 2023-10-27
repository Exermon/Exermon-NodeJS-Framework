import {config} from "../../config/ConfigManager";

export type RedisConfig = {
    host: string
    port: number
    password: string
    db?: number
}

declare module "../../config/ConfigType" {
    interface MainConfig {
        redis?: RedisConfig
    }
}

export default function() { return config().redis }
