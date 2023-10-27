import {BaseInterface, get, route} from "../http/InterfaceManager";

@route("/api/count")
export class UserInterface extends BaseInterface {
    @get("/")
    async getCountData() {
        return {count: 200};
    }
}