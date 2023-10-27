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

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(255))
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
    level: UserLevel;

    @JSONColumn
    addresses: string[];

}
