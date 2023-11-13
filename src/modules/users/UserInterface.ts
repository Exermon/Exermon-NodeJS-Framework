import {BaseInterface, body, custom, get, post, route} from "../http/InterfaceManager";
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
    @post("/update")
    async updateUser(
        @body("user") user: User,
        @custom("auth") payload: Payload) {
        await User.update({
            email: user.email,
            card: user.card,
            userName: user.userName,
            region: user.region,
            level: user.level,
            addresses: user.addresses,
        }, {where: {phone: payload.phone}});

    }

    @auth()
    @get("/me")
    async getMyProfile(@custom("auth") payload: Payload) {
        return {
            user: await User.findOne({where: {phone: payload.phone}})
        }
    }

    @post("/login")
    async login(
        @body("phone") phone: string,
        @body("code") code: string) {
        if (!this.validPhone(phone)) throw "参数不合法";
        await smsMgr().checkCode(phone, code, false);

        let user = await User.findOne({where: {phone}});
        let registered = true;
        if (!user) { //注册
            registered = false;
            await this.register(phone);
        }

        return {
            jwt: await authMgr().createKey({phone: phone}),
            user, registered
        };
    }

    async register(phone: string) {
        const pk = Wallet.createRandom().privateKey;
        try {
            await User.create({
                phone,
                addresses: [pk]
            });
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