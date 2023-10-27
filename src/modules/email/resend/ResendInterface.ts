import {BaseInterface, body, post, route} from "../../http/InterfaceManager";
import {resendMgr, WebhookData, WebhookType} from "./ResendManager";


@route("/resend")
export class ResendInterface extends BaseInterface {

  @post("/webhook")
  async webhook(
    @body("type") type: WebhookType,
    @body("data") data: WebhookData,
    @body("created_at") created_at: string,
  ) {
    console.log("[Resend webhook]", type, data, created_at)
    await resendMgr().handleWebhook(type, data);
  }
}
