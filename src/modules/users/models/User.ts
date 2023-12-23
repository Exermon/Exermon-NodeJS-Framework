import {BaseModel, JSONColumn} from "../../sequelize/BaseModel";
import {model} from "../../sequelize/SequelizeManager";
import {AllowNull, AutoIncrement, Column, DataType, PrimaryKey, Table, Unique} from "sequelize-typescript";

export enum UserLevel {
    Normal = 0, // 普通用户
    Dev = 1, //开发者
    Vip = 2 //VIP
}

@model
@Table({
    freezeTableName: true,
    timestamps: true,
    modelName: "user",
})
export class User extends BaseModel {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: string;

    @Unique
    @Column(DataType.STRING(32))
    phone: string;

    @Column(DataType.STRING(255))
    email?: string;

    @Column(DataType.STRING(255))
    card?: string;


    @Column(DataType.STRING(255))
    userName?: string;

    @Column(DataType.STRING(255))
    region?: string;

    @Column(DataType.SMALLINT)
    level?: UserLevel;

    @Column(DataType.STRING(255))
    privateKey?: string;

    @JSONColumn
    addresses?: string[];

    toJSON() {
        return {
            id: this.id,
            phone: this.phone,
            email: this.email,
            card: this.card,
            userName: this.userName,
            region: this.region,
            level: this.level,
            addresses: this.addresses,
        }
    }
}
