import {config} from "../../config/ConfigManager";

export type HTTPConfig = {
    port: number
    baseRoute?: string
}

declare module "../../config/ConfigType" {
    interface MainConfig {
        http?: HTTPConfig
    }
}

export default function() { return config().http }
