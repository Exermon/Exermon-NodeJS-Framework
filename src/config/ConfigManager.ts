import {GlobalConfig, GlobalEnv, NacosConfigLoader} from "./ConfigLoader";

export function config() { return GlobalConfig; }
export function env() { return GlobalEnv; }
export function ServerConfig() { return config().server; }