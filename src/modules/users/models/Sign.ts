import {BaseModel, JSONColumn} from "../../sequelize/BaseModel";
import {model} from "../../sequelize/SequelizeManager";
import {AllowNull, AutoIncrement, Column, DataType, PrimaryKey, Table, Unique} from "sequelize-typescript";

@model
@Table({
    freezeTableName: true,
    timestamps: true,
    modelName: "sign",
})
export class Sign extends BaseModel {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: string;

    @Column(DataType.STRING(255))
    sign: string; // 签名

    @Column(DataType.STRING(255))
    message: string; // 签名的消息

    @Column(DataType.STRING(255))
    appId: string; // 签名的应用

    @Column(DataType.STRING(255))
    signType: number; // 签名的类型

    @Column(DataType.STRING(255))
    redirectUrl: string; // 签名成功后的跳转地址

    @Column(DataType.STRING(255))
    creator: string; // 签名者手机号
}
