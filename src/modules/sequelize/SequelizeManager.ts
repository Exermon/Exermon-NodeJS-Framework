import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import {SyncOptions} from "sequelize";
import {Sequelize} from "sequelize-typescript";
import {ModelCtor} from "sequelize-typescript/dist/model/model/model";
import {DropOptions} from "sequelize/types/model";
import {Transaction, TransactionOptions} from "sequelize/lib/transaction";
import SequelizeConfig, {RawSequelizeConfig} from "./SequelizeConfig";

export function model(clazzOrSeqKey?: ModelCtor | string) {
    if (clazzOrSeqKey && typeof clazzOrSeqKey != "string")
        return model()(clazzOrSeqKey)

    const seqKey = clazzOrSeqKey as string
    return (clazz) => {
        sequelizeMgr().registerModel(clazz, seqKey);
    }
}

export function transaction(
    optionsOrObj: TransactionOptions | object,
    keyOrIndex?: string | number, seqKeyOrDesc?: string | any): any {
    if (typeof keyOrIndex == "string" && seqKeyOrDesc)
        transaction({})(optionsOrObj, keyOrIndex, seqKeyOrDesc);
    else {
        const options = optionsOrObj as TransactionOptions;
        const seqKey = seqKeyOrDesc as string;
        return (obj, key, desc) => {
            const oriFunc = desc.value;
            desc.value = function (...p) {
                // 默认为传入参数的下一个
                const index = keyOrIndex == null ? p.length : keyOrIndex as number;
                // 确保 index <= p.length - 1
                while (index > p.length - 1) p.push(undefined);

                if (p[index] instanceof Transaction)
                    return oriFunc.call(this, ...p)
                else
                    return sequelize(seqKey).transaction(options, (t) =>
                        (p[index] = t, oriFunc.call(this, ...p)));
            }
        }
    }
}

export function sequelizeMgr() {
    return getManager(SequelizeManager)
}

export function sequelize(key?) {
    return key ? sequelizeMgr().sequelizes[key] : sequelizeMgr().sequelize;
}

@manager
export class SequelizeManager extends BaseManager {

    public sequelizes: { [K in string]: Sequelize } = {}

    public get sequelize() {
        return this.sequelizes["default"]
    }

    private models: ModelCtor[] = [];
    private modelSeqMap: string[] = [];

    public registerModel(model: ModelCtor, seqKey = "default") {
        this.models.push(model);
        this.modelSeqMap.push(seqKey);
    }

    public onStart() {
        super.onStart();
        this.setupSequelizes();
    }

    private setupSequelize(config: RawSequelizeConfig, seqKey = "default") {
        const models = this.models.filter((m, i) => seqKey == this.modelSeqMap[i]);
        console.log(`Register models for ${seqKey}: `, models.map(m => m.name));

        return new Sequelize({
            dialect: "mysql",
            dialectOptions: {
                supportBigNumbers: true,
                bigNumberStrings: true,
                connectTimeout: 180000,
            },
            pool: {max: 500, min: 2, idle: 30, acquire: 30000},
            timezone: "+08:00", models, ...config,
            logging: console.log,
            define: {charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci'}

        })
    }

    private setupSequelizes() {
        let config = SequelizeConfig();
        if (!config.multiple)
            this.sequelizes["default"] = this.setupSequelize(config as RawSequelizeConfig)
        else
            for (const key in config)
                if (typeof config[key] == "object")
                    this.sequelizes[key] = this.setupSequelize(config[key], key)
    }

    public sync(options: SyncOptions = {alter: true}) {
        return this.sequelize.sync(options)
    }

    public syncAll(options: SyncOptions = {alter: true}) {
        return Object.values(this.sequelizes).map(s => s.sync(options))
    }

    public drop(options?: DropOptions) {
        return this.sequelize.drop(options)
    }

    public dropAll(options?: DropOptions) {
        return Object.values(this.sequelizes).map(s => s.drop(options))
    }

}
