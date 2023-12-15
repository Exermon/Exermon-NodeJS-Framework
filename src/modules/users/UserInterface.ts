import {BaseInterface, body, custom, get, post, query, route} from "../http/InterfaceManager";
import {User} from "./models/User";
import {BaseError} from "../http/utils/ResponseUtils";
import {UniqueConstraintError} from "sequelize";
import {smsMgr} from "./SMSManager";
import {MathUtils} from "../../utils/MathUtils";
import {ethers, Wallet} from 'ethers';
import {auth, authMgr, Payload} from "../auth/AuthManager";
import {Application} from "../application/models/Application";
import {hexlify, recoverAddress, toUtf8Bytes} from "ethers/lib/utils";


@route("/user")
export class UserInterface extends BaseInterface {

    @auth()
    @post("/update")
    async updateUser(
        @body("user") user: User,
        @custom("auth") payload: Payload) {
        if (user.card && !this.validIdCard(user.card)) throw "身份证号不合法";
        if (user.email && !this.validEmail(user.email)) throw "邮箱不合法";
        await User.update({
            email: user.email,
            card: user.card,
            userName: user.userName,
            region: user.region,
            level: user.level,
            // addresses: user.addresses,
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
        if (!this.validPhone(phone)) throw "手机号不合法";
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
        // 通过私钥换取地址
        const address = new Wallet(pk).address;
        try {
            await User.create({
                phone,
                addresses: [address],
                privateKey: pk,
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
        if (!this.validPhone(phone)) throw "手机号不合法";
        const code = MathUtils.randomString(4, "0123456789");
        await smsMgr().sendCode(code, phone);
    }

    @auth()
    @post("/sign")
    async sign(
        // @body("app") app: string, // 授权签名的app
        @body("message") message: string, // 授权签名的消息
        @custom("auth") payload: Payload) {
        const user = await User.findOne({where: {phone: payload.phone}});
        if (!user) throw "用户不存在";

        // 使用user中的私钥签名
        const wallet = new Wallet(user.privateKey);
        const sign = await wallet.signMessage(message);
        return {
            sign
        }
    }


    @get("/message")
    async getMessage() {
        return {
            message: this.message
        }
    }

    message = "dou nb!"

    @auth()
    @post("/address/input")
    async inputAddress(
        @body("address") address: string, //需要导入的地址
        @body("sign") sign: string,
        @custom("auth") payload: Payload) {
        const user = await User.findOne({where: {phone: payload.phone}});
        if (!user) throw "用户不存在";

        // // 验证签名
        // try {
        //     const recovered = recoverAddress(hexlify(toUtf8Bytes(this.message)), sign)
        //     console.log("[recoverAddress] recovered: ", recovered)
        //     if (!user.addresses.includes(recovered)) throw "签名不正确";
        // } catch (e) {
        //     throw "签名校验不通过";
        // }

        user.addresses.push(address);
        await user.save();
    }

    private validPhone(phone: string) {
        // 使用正则表达式校验手机号是否合法
        return /^1[3456789]\d{9}$/.test(phone);
    }

    private validIdCard(card: string) {
        // 使用正则表达式校验身份证号是否合法
        return /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(card);
    }

    private validEmail(email: string) {
        // 使用正则表达式校验邮箱是否合法
        return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/.test(email);
    }
}