import JWT, {JwtPayload} from "jsonwebtoken";
import {makeMiddle} from "../http/InterfaceManager";
import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import {BaseError, NotFoundError} from "../http/utils/ResponseUtils";
import {APP_META} from "../../config/ConfigLoader";


export interface Payload extends JwtPayload {
    phone: string
}

const JWTExpireTime = 60 * 60 * 24 * 3;

export enum AuthType {
    Normal,
    Super
}

export function auth(type: AuthType = AuthType.Normal, throw_ = true) {
    return (obj, key, desc) => {
        makeMiddle(obj, key, desc, "auth", async (req, res) => {
            try {
                let res: Payload;
                const token = req.header('Authorization');
                res = await authMgr().processKey(token);
                return res || {};
            } catch (e) {
                if (throw_) throw e;
                else console.error("Auth error: ", e);
            }
            return {}
        } )
    }
}

export function authMgr() {
    return getManager(AuthManager);
}

@manager
class AuthManager extends BaseManager {
    private certKey: string;
    onStart() {
        super.onStart();
        this.certKey =  APP_META.projectName;
    }

    /**
     *  创建JWT
     */
    public async createKey(payload: Payload) {
        return this.generateKey(payload)
    }

    /**
     * Key签发
     */
    private generateKey(payload: Payload) {
        return JWT.sign(payload, this.certKey, {expiresIn: JWTExpireTime});
    }

    /**
     * Key校验
     */
    public verifyKey(key) {
        let res: {
            success: boolean, errMsg?: string, payload?: Payload
        };
        JWT.verify(key, this.certKey, (err, decoded) => {
            res = err ?
                {success: false, errMsg: err.message} :
                {success: true, payload: decoded};
            if (!err) {
                delete decoded.iat;
                delete decoded.exp;
            }
        })
        return res;
    }

    public async processKey(key) {
        let res = this.verifyKey(key);
        if (!res.success) throw new BaseError(403, "Key Verify Error", res);
        return res.payload;
    }
}
