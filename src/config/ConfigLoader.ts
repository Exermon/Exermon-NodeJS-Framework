import {DefaultConfig, EnvType, MainConfig} from "./ConfigType";
import Consul from "consul";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export let GlobalConfig: MainConfig = DefaultConfig;
export let GlobalEnv: EnvType = process.env["NODE_ENV"] as EnvType || "default";
export let LocalConfigPath = process.env["CONFIG_PATH"] || ".";

export const APP_META = {
    "projectName": "dou-server",
    "consulHost": "8.138.58.80"
}

export async function setupConf() {
    GlobalConfig = await new ConsulConfigLoader(APP_META.consulHost, APP_META.projectName).load(GlobalEnv);
    console.log("[Load Config]", GlobalConfig)
}


interface ConfigLoader {
    /**
     * 加载某个环境下的配置
     * @param env 环境唯一标识
     */
    load(env: string): Promise<MainConfig>
}


export class FileConfigLoader implements ConfigLoader {
    constructor(configDirPath: string) {
        this.configDirPath = configDirPath;
    }

    private readonly configDirPath: string
    load(env: string): Promise<MainConfig> {
        return JSON.parse(fs.readFileSync(
            `${this.configDirPath}/env.${env}.json`).toString());
    }

}

export class ConsulConfigLoader implements ConfigLoader {
    private readonly host: string;
    private readonly projectName: string;

    private readonly consulClient: Consul;

    constructor(host: string, projectName: string) {
        this.host = host;
        this.projectName = projectName;
        this.consulClient = new Consul({
            host: this.host,
            port: 8500,
        });
    }

    async load(env: string): Promise<MainConfig> {
        const {Value: configText} = await this.consulClient.kv.get(this.getKey(env));
        return JSON.parse(configText);
    }

    private getKey(env: string) {
        return `${this.projectName}/${env}`;
    }
}




// export class NacosConfigLoader implements ConfigLoader {
//     private readonly nacosServer: string;
//     private readonly projectName: string;
//
//     constructor(nacosServer: string, projectName: string) {
//         this.nacosServer = nacosServer;
//         this.projectName = projectName;
//     }
//
//
//     async load(env: string): Promise<MainConfig> {
//         const configText = await this.client.getConfig(this.getDataId(env), "DEFAULT_GROUP")
//         return JSON.parse(configText);
//     }
//
//     get client() {
//         return new NacosConfigClient({
//             serverAddr: this.nacosServer,
//             namespace: this.projectName,
//         })
//     }
//
//     // 获取nacos DataId
//     getDataId(env: string) {
//         return env;
//     }
// }