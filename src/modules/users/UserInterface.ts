import {BaseInterface, body, get, post, route} from "../http/InterfaceManager";
import {User} from "./models/User";
import {BaseError} from "../http/utils/ResponseUtils";
import {UniqueConstraintError} from "sequelize";
import {smsMgr} from "./SMSManager";
import {MathUtils} from "../../utils/MathUtils";
import { Wallet } from 'ethers';
import {auth, authMgr, Payload} from "../auth/AuthManager";


@route("/user")
export class UserInterface extends BaseInterface {
    @auth()
    @get("/me")
    async getMyProfile(payload: Payload) {
        return {
            user: await User.findOne({where: {phone: payload.phone}})
        }
    }

    @post("/login")
    async login(
        @body("phone") phone: string,
        @body("code") code: string) {
        if (!this.validPhone(phone)) throw "参数不合法";
        await smsMgr().checkCode(phone, code, false)

        let user = await User.findOne({where: {phone}});
        let registered = true;
        if (!user) { //注册
            registered = false;
            user = new User();
            user.phone = phone;
            await this.register(user);
        }

        return {
            jwt: authMgr().createKey({phone: user.phone}),
            user, registered
        };
    }

    async register(user: User) {
        const pk = Wallet.createRandom().privateKey;
        if (!user.addresses) user.addresses = [];
        user.addresses.push(pk);

        try {
            await User.create(user);
        } catch (e) {
            if (e instanceof UniqueConstraintError)
                throw new BaseError(400, "手机号已经被注册");
            throw e;
        }
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