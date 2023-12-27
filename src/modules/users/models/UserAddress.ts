import {BaseModel, JSONColumn} from "../../sequelize/BaseModel";
import {model} from "../../sequelize/SequelizeManager";
import {AllowNull, AutoIncrement, Column, DataType, PrimaryKey, Table, Unique} from "sequelize-typescript";

export enum AddressType {
    Inner = 0, // 内部地址
    Outer = 1, // 外部地址
}

@model
@Table({
    freezeTableName: true,
    timestamps: true,
    modelName: "user_address",
})
export class UserAddress extends BaseModel {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: string;

    @Column(DataType.STRING(255))
    userId: string;

    @Column(DataType.STRING(255))
    address: string; // 地址

    @Column(DataType.SMALLINT)
    addressType: AddressType; // 地址类型

    @Column(DataType.STRING(255))
    privateKey?: string; // 私钥，仅内部地址持有

    @Column(DataType.STRING(255))
    signId?: string; // 交易hash，仅外部地址绑定时存在
}
