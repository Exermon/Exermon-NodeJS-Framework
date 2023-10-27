import {BaseInterface, get, route} from "../../http/InterfaceManager";
import {snowflake} from "./Snowflake";

@route("/snowflake")
export class SnowflakeInterface extends BaseInterface {

  @get("/id")
  getId() { return snowflake.generate(); }
}
