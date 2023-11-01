import fs from "fs";
import {DefaultConfig, MainConfig} from "./ConfigType";
import {schedule, scheduleTask} from "../utils/CronUtils";
import dotenv from "dotenv"
import {BaseManager, getManager, manager} from "../app/ManagerContext";

dotenv.config();

export type EnvType = "prod" | "dev" | "test" | "default" | string;

const ConfigPath = process.env["CONFIG_PATH"] || "..";
const DefaultConfigClearCron = "0 * * * * *";

export function config() { return configMgr().config; }
export function env() { return configMgr().env; }

export function ServerConfig() { return config().server; }

export function configMgr() {
  return getManager(ConfigManager);
}

@manager
export class ConfigManager extends BaseManager {

  public envType: EnvType = "default";

  private updateHandler: () => Promise<MainConfig>
  private loadedHandler: (c: MainConfig) => Promise<void>

  public get env(): EnvType {
    return process.env["NODE_ENV"] as EnvType || this.envType;
  }

  public config: MainConfig = this.loadConfigFromFile()

  public registerHandlers(
    updateHandler: () => Promise<MainConfig>,
    loadedHandler: (c: MainConfig) => Promise<void>) {
    this.updateHandler = updateHandler;
    this.loadedHandler = loadedHandler;
  }

  private async updateConfig() {
    let config
    if (this.updateHandler)
      try {
        config = await this.updateHandler();
        this.saveConfigToFile(config);
      } catch (e) {
        console.error("[Config Handler Error] updateHandler", e)
      }
    config ||= this.loadConfigFromFile()

    console.log("[Config Updated]", this.config = config);
  }
  private loadConfigFromFile(): MainConfig {
    try {
      return JSON.parse(fs.readFileSync(
        `${ConfigPath}/env.${this.env}.json`).toString());
    } catch (e) {
      console.log("[Config Loading Error]", e);

      try {
        const names = fs.readdirSync("./");
        console.log("Tips: ./ files", names);
        const pNames = fs.readdirSync("../");
        console.log("Tips: ../ files", pNames);
        const p2Names = fs.readdirSync("../../");
        console.log("Tips: ../../ files", p2Names);
      } catch (e) {}

      return DefaultConfig
    }
  }
  private saveConfigToFile(config: MainConfig) {
    fs.writeFileSync(
      `${ConfigPath}/env.${this.env}.json`,
      JSON.stringify(config, null, 2));
  }

  async onReady() {
    super.onReady();
    await this.updateConfig();
    try { await this.loadedHandler?.(this.config) }
    catch (e) { console.error("[Config Handler Error] loadedHandler", e) }
    scheduleTask(DefaultConfigClearCron, () => this.updateConfig());
  }
}
