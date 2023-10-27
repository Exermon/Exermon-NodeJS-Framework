import {BaseManager, getManager, manager} from "../../../app/ManagerContext";
import EmailConfig, {EmailType} from "../EmailConfig";
import {StringUtils} from "../../../utils/StringUtils";
import {BaseError, NotFoundError} from "../../http/utils/ResponseUtils";
import { Resend } from 'resend';
import ResendConfig from "./ResendConfig";

export type WebhookType = "email.sent" | "email.delivered" |
  "email.bounced" | "email.complained" | "email.failed" |
  "email.opened" | "email.clicked";
export type WebhookData = {
  created_at: string,
  email_id: string,
  from: string,
  to: string[],
  subject: string,
  click?: {
    ipAddress: string,
    link: string,
    timestamp: string,
    userAgent: string
  }
}
export type WebHookHandler = (data: WebhookData) => any;

export function resendMgr() {
  return getManager(ResendManager);
}

@manager
export class ResendManager extends BaseManager {

  public client: Resend;

  public webhookHandlers: {[key in WebhookType]?: WebHookHandler[]} = {}

  onStart() {
    super.onStart();
    if (!ResendConfig()) return;
    this.client = new Resend(ResendConfig().apiKey);
  }

  public registerWebhook(type: WebhookType, func: WebHookHandler) {
    this.webhookHandlers[type] ||= [];
    this.webhookHandlers[type].push(func);
  }

  public async handleWebhook(type: WebhookType, data: WebhookData) {
    const handlers = this.webhookHandlers[type];
    if (!handlers || handlers.length === 0) return;
    for (const handler of handlers) await handler(data);
  }

  /**
   * 配置邮件
   */
  private async configEmail(type: EmailType, toAddress: string | string[], params: any = {}) {
    const template = EmailConfig().templates[type];
    if (!template) throw new NotFoundError("Template");

    let {subject, body} = template;

    if (typeof subject != 'string' || typeof body != 'string')
      throw new BaseError("This function is not implemented");

    subject = StringUtils.fillData2Str(subject, params, false);
    body = StringUtils.fillData2Str(body, params, false);

    return {
      from: ResendConfig().user,
      to: typeof toAddress === 'string' ? [toAddress] : toAddress,
      subject: subject as string, html: body as string
    }
  }

  /**
   * 发送邮件
   */
  public async sendEmail(type: EmailType, toAddress: string | string[], params: any = {}) {
    try {
      console.log("[Resend] sendEmail config", type, toAddress, params);
      const emailParams = await this.configEmail(type, toAddress, params);
      console.log("[Resend] sendEmail start", emailParams);
      const whitelist = EmailConfig().whitelist;
      if (whitelist) {
        emailParams.to = emailParams.to.filter(e => whitelist.includes(e));
        console.log("[Resend] sendEmail processed whitelist", whitelist, emailParams.to);
      }
      if (emailParams.to.length <= 0) return

      const res = await this.client.emails.send(emailParams);
      console.log("[Resend] sendEmail success", res);
      return res;
    } catch (err) {
      console.error("[Resend] sendEmail fail", err);
      throw new BaseError(601, err);
    }
  }
}
