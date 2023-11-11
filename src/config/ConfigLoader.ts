import {DefaultConfig, MainConfig} from "./ConfigType";
import {NacosConfigClient} from "nacos";
import fs from "fs";

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

export class NacosConfigLoader implements ConfigLoader {
    private readonly nacosServer: string;
    private readonly projectName: string;

    constructor(nacosServer: string, projectName: string) {
        this.nacosServer = nacosServer;
        this.projectName = projectName;
    }


    async load(env: string): Promise<MainConfig> {
        const configText = await this.client.getConfig(this.getDataId(env), "DEFAULT_GROUP")
        return JSON.parse(configText);
    }

    get client() {
        return new NacosConfigClient({
            serverAddr: this.nacosServer,
            namespace: this.projectName,
        })
    }

    // 获取nacos DataId
    getDataId(env: string) {
        return env;
    }
}