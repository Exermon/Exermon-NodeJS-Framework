import {BaseInterface, get, route} from "../http/InterfaceManager";

@route("/count")
export class UserInterface extends BaseInterface {
    @get("/")
    async getCountData() {
        return {count: 200};
    }
}