import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import fs from "fs";
import express, {Express} from "express";
import http from "http";
import https from "https";
import {config} from "../../config/ConfigManager";
import HTTPConfig from "./HTTPConfig";
import {IsScriptMode} from "../../app/App";

export const CertInfo = { key: null, cert: null };
try {
  CertInfo.key = fs.readFileSync('./server.key');
  CertInfo.cert = fs.readFileSync('./server.crt')
} catch (e) {
  console.log("由于缺少证书，无法启动HTTPS服务器，已用HTTP代替")
}

export function httpMgr() {
  return getManager(HTTPManager)
}

@manager
export class HTTPManager extends BaseManager {

  private app: Express;
  private server: http.Server | https.Server;

  private appProcessors: ((app: Express) => void)[] = [];

  async onStart() {
    super.onStart();
    if (IsScriptMode) return;
    this.app = this.setupApp();
    this.server = await this.listen()
  }

  // region 初始化APP

  public registerAppProcessor(func: (app: Express) => void) {
    this.appProcessors.push(func);
  }

  protected setupApp() {
    const res = express();
    this.appProcessors.forEach(p => p(res));
    return res
  }

  private listen(port = HTTPConfig().port) {
    if (!port) return; // 关闭HTTP端口
    return new Promise<http.Server | https.Server>(resolve => {
      const server = CertInfo.cert ?
        https.createServer(CertInfo, this.app)
          .listen(port, () => this.onListenStart(resolve, server)) :
        this.app.listen(port, () => this.onListenStart(resolve, server))
    });
  }

  protected onListenStart(resolve, server) {
    const addr = server.address();
    if (typeof addr === 'string') console.log("应用实例", addr)
    else if (addr) {
      let host = addr.address;
      let port = addr.port;

      console.log("应用实例", host, port)
    }
    resolve(server);
  }

  // endregion
}
