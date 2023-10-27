import {BaseInterface, get, post, route} from "../http/InterfaceManager";
import {Application} from "./models/Application";

@route("/api/applications")
export class ApplicationInterface extends BaseInterface {
    @get("/")
    async getApplications() {
        return {
            applications: await Application.findAll()
        };
    }
}