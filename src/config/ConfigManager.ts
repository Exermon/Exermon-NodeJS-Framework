import {DefaultConfig, MainConfig} from "./ConfigType";
import dotenv from "dotenv"
import {BaseManager, getManager, manager} from "../app/ManagerContext";
import {NacosConfigLoader} from "./ConfigLoader";

// TODO 修改项目元信息
const APP_META = {
  "projectName": "example",
  "nacosServer": "127.0.0.1:8848"
}

dotenv.config();

export type EnvType = "prod" | "dev" | "test" | "default" | string;

const ConfigPath = process.env["CONFIG_PATH"] || ".";

export function config() { return configMgr().config; }
export function env() { return configMgr().env; }

export function ServerConfig() { return config().server; }

export function configMgr() {
  return getManager(ConfigManager);
}

@manager
export class ConfigManager extends BaseManager {

  private updateHandler: () => Promise<MainConfig>
  private loadedHandler: (c: MainConfig) => Promise<void>

  public get env(): EnvType {
    return process.env["NODE_ENV"] as EnvType || "default";
  }

  public config: MainConfig;


  async onStart() {
    super.onStart();

    const confLoader = new NacosConfigLoader(APP_META.nacosServer, APP_META.projectName);
    this.config = await confLoader.load(this.env);
  }

  // public registerHandlers(
  //   updateHandler: () => Promise<MainConfig>,
  //   loadedHandler: (c: MainConfig) => Promise<void>) {
  //   this.updateHandler = updateHandler;
  //   this.loadedHandler = loadedHandler;
  // }

  // private async updateConfig() {
  //   let config
  //   if (this.updateHandler)
  //     try {
  //       config = await this.updateHandler();
  //       this.saveConfigToFile(config);
  //     } catch (e) {
  //       console.error("[Config Handler Error] updateHandler", e)
  //     }
  //   config ||= this.loadConfigFromFile()
  //
  //   console.log("[Config Updated]", this.config = config);
  // }
  // private loadConfigFromFile(): MainConfig {
  //   try {
  //     return JSON.parse(fs.readFileSync(
  //       `${ConfigPath}/env.${this.env}.json`).toString());
  //   } catch (e) {
  //     console.log("[Config Loading Error]", e);
  //
  //     try {
  //       const names = fs.readdirSync("./");
  //       console.log("Tips: ./ files", names);
  //       const pNames = fs.readdirSync("../");
  //       console.log("Tips: ../ files", pNames);
  //       const p2Names = fs.readdirSync("../../");
  //       console.log("Tips: ../../ files", p2Names);
  //     } catch (e) {}
  //
  //     return DefaultConfig
  //   }
  // }
  // private saveConfigToFile(config: MainConfig) {
  //   fs.writeFileSync(
  //     `${ConfigPath}/env.${this.env}.json`,
  //     JSON.stringify(config, null, 2));
  // }

  async onReady() {
    super.onReady();
  }
}
