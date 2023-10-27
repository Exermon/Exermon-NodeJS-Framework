import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import {Client} from "tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client";
import {redisMgr} from "../redis/RedisManager";
import {DateUtils} from "../../utils/DateUtils";


class CodeMessage {
    code: string; //验证码
    sendTime: number; //发送时间


    constructor(code: string) {
        this.code = code;
    }
}

export function smsMgr() {
    return getManager(SMSManager)
}


@manager
export class SMSManager extends BaseManager {
    private smsClient: Client;
    private invalidSeconds: number; //验证码过期时间


    // https://cloud.tencent.com/document/product/382/43197
    async onStart() {
        super.onStart();
        this.smsClient = new Client({
            // 为了保护密钥安全，建议将密钥设置在环境变量中或者配置文件中，请参考本文凭证管理章节。
            // 硬编码密钥到代码中有可能随代码泄露而暴露，有安全隐患，并不推荐。
            credential: {
                secretId: process.env.TENCENTCLOUD_SECRET_ID,
                secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
            },
            // 产品地域
            region: "ap-shanghai",
            // 可选配置实例
            profile: {
                signMethod: "TC3-HMAC-SHA256", // 签名方法
                httpProfile: {
                    reqMethod: "POST", // 请求方法
                    reqTimeout: 30, // 请求超时时间，默认60s
                    // proxy: "http://127.0.0.1:8899" // http请求代理
                },
            },
        })
        const r = await this.smsClient.getCredential();
        console.log(r)
    }



    async sendCode(code: string, phone: string) {
       const codeMessage = new CodeMessage(code);
       await this.remoteSendCode(code, phone);
       // 成功发送短信后，将短信缓存到redis
       await redisMgr().setKVData(this.codeKey(phone), codeMessage, this.invalidSeconds+5);
    }
    codeKey(phone: string) {
        return `code:${phone}`
    }



    async checkCode(phone: string, code: string,
                    clearAfterSuccess: boolean = false) {
        const codeMessage = await redisMgr().getKVData<CodeMessage>(this.codeKey(phone))
        if (!codeMessage) return false;
        if (codeMessage.code !== code) return false;
        if (clearAfterSuccess) await redisMgr().deleteKV(this.codeKey(phone))
        return true;
    }



    async remoteSendCode(code: string, phone: string) {
        const params = {
            /* 短信应用ID: 短信SmsSdkAppId在 [短信控制台] 添加应用后生成的实际SmsSdkAppId，示例如1400006666 */
            // 应用 ID 可前往 [短信控制台](https://console.cloud.tencent.com/smsv2/app-manage) 查看
            SmsSdkAppId: "1400787878",
            /* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名 */
            // 签名信息可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-sign) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-sign) 的签名管理查看
            SignName: "腾讯云",
            /* 模板 ID: 必须填写已审核通过的模板 ID */
            // 模板 ID 可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-template) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-template) 的正文模板管理查看
            TemplateId: "449739",
            /* 模板参数: 模板参数的个数需要与 TemplateId 对应模板的变量个数保持一致，若无模板参数，则设置为空 */
            TemplateParamSet: [code],
            /* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
             * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
            PhoneNumberSet: [phone],
            /* 用户的 session 内容（无需要可忽略）: 可以携带用户侧 ID 等上下文信息，server 会原样返回 */
            SessionContext: "",
            /* 短信码号扩展号（无需要可忽略）: 默认未开通，如需开通请联系 [腾讯云短信小助手] */
            ExtendCode: "",
        }

        await this.smsClient.SendSms(params);
    }
}