import {BaseModel, DateTimeColumn, JSONColumn} from "../../sequelize/BaseModel";
import {model} from "../../sequelize/SequelizeManager";
import {AllowNull, AutoIncrement, Column, DataType, PrimaryKey, Table, Unique} from "sequelize-typescript";
import {BigNumber} from "@ethersproject/bignumber";

export enum TransactionState {
    Pending = 0, // 交易已经被提交，但是还没有被打包
    Success = 1, // 交易已经完全成功
    Failed = 2, // 交易失败
}

@model
@Table({
    freezeTableName: true,
    timestamps: true,
    modelName: "transaction",
})
export class Transaction extends BaseModel {

    @PrimaryKey
    @Column(DataType.STRING(255))
    txHash!: string;

    @Column(DataType.INTEGER)
    chainId: number;

    @Column(DataType.INTEGER)
    blockHeight: number;

    @DateTimeColumn
    blockTime: number

    @Column(DataType.STRING(255))
    from: string
    @Column(DataType.STRING(255))
    to: string

    @Column(DataType.INTEGER)
    nonce: number;

    @Column(DataType.BIGINT)
    gasLimit: string;
    @Column(DataType.BIGINT)
    gasPrice?: string;

    @Column(DataType.TEXT)
    data: string;

    @Column(DataType.BIGINT)
    value: string;

    @Column(DataType.INTEGER)
    state: TransactionState;
}
