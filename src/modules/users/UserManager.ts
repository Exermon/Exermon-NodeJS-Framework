import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import JWT, {JwtPayload} from "jsonwebtoken";


export function userMgr() {
    return getManager(UserManager)
}

export interface Payload extends JwtPayload {
    phone: string
}


@manager
export class UserManager extends BaseManager {

    private jwtCertKey: string;
    private jwtExpires: number;


    public createKey(phone: string) {
        return this.generateKey({phone})
    }
    private generateKey(payload: Payload) {
        return JWT.sign(payload, this.jwtCertKey, {expiresIn: this.jwtExpires});
    }

    /**
     * Key校验
     */
    public verifyKey(key) {
        let res: {
            success: boolean, errMsg?: string, payload?: Payload
        };
        JWT.verify(key, this.jwtCertKey, (err, decoded) => {
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
}