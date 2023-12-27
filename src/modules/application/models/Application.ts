import {BaseModel} from "../../sequelize/BaseModel";
import {model} from "../../sequelize/SequelizeManager";
import {AllowNull, AutoIncrement, Column, DataType, PrimaryKey, Table} from "sequelize-typescript";

@model
@Table({
    freezeTableName: true,
    timestamps: false,
    modelName: "app"
})
export class Application extends BaseModel {
    @PrimaryKey
    @Column(DataType.BIGINT)
    id!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    appName: string;

    @Column(DataType.STRING(255))
    desc: string;

    @Column(DataType.STRING(255))
    domain: string;

    @Column(DataType.STRING(255))
    logo: string;

    @Column(DataType.STRING(255))
    defaultRedirectUrl: string;

    @Column(DataType.STRING(1023))
    developers: string; // 开发者列表，以英文分号分割

}