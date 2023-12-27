import {BaseInterface, get, params, post, route} from "../http/InterfaceManager";
import {Application} from "./models/Application";
import * as path from "path";

@route("/applications")
export class ApplicationInterface extends BaseInterface {
    @get("/")
    async getApplications() {
        return {
            applications: await Application.findAll()
        };
    }

    @get("/:appId")
    async getApplication(@params("appId") appId: string) {
        return {
            application: await Application.findByPk(appId)
        };
    }
}