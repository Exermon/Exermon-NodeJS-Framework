import {BaseInterface, body, post, route} from "../http/InterfaceManager";
import {User} from "./models/User";
import {userMgr} from "./UserManager";
import {BaseError} from "../http/utils/ResponseUtils";
import {UniqueConstraintError} from "sequelize";
import {smsMgr} from "./SMSManager";
import {MathUtils} from "../../utils/MathUtils";


@route("/api/user")
export class UserInterface extends BaseInterface {

    @post("/login")
    async login(
        @body("phone") phone: string,
        @body("code") code: string) {
        if (!this.validPhone(phone)) throw "参数不合法";
        const passed = await smsMgr().checkCode(phone, code, false)
        if (!passed) throw new BaseError(403, "验证码错误")

        const user = await User.findOne({where: {phone}});
        if (!user) return {registered: false};

        return {
            jwt: userMgr().createKey(user.phone), user,
            registered: true
        };
    }

    @post("/register")
    async register(
        @body("user") user: User,
        @body("code") code: string) {
        if (!user || !this.validPhone(user.phone)) throw "参数不合法";
        const passed = await smsMgr().checkCode(user.phone, code, true)
        if (!passed) throw new BaseError(403, "验证码错误")

        try {
            await User.create(user);
        } catch (e) {
            if (e instanceof UniqueConstraintError) throw new BaseError(400, "手机号已经被注册");
            throw e;
        }

        return {jwt: userMgr().createKey(user.phone)};
    }

    @post("/sendCode")
    async sendCode(
        @body("phone") phone: string,
        @body("codeType", true) codeType?: string) {
        if (!this.validPhone(phone)) throw "参数不合法";

        const code = MathUtils.randomString(4, "0123456789");
        await smsMgr().sendCode(code, phone);
    }


    private validPhone(phone: string) {
        if (!phone || !phone.startsWith("+")) return false;
        return true;
    }
}