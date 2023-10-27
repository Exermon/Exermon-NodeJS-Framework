# Exermon NodeJS Framework

## Getting Started

### 创建配置项

从 `example.env.json` 复制一份配置文件

```bash
cp example.env.json env.default.json
```

在 `env.default.json` 中填写配置项，比如配置Sequelize连接数据库的参数。

#### 配置项说明

部分重点配置项说明如下：

| 配置项 | 说明 |
| --- | --- |
| `http` | HTTP配置 |
| `http.port` | 接口监听端口 |
| `http.baseRoute` | 接口根路由 |
| `sequelize` | Sequelize配置 |
| `sequelize.host` | 数据库地址 |
| `sequelize.port` | 数据库端口 |
| `sequelize.username` | 数据库用户名 |
| `sequelize.password` | 数据库密码 |
| `sequelize.database` | 连接的数据库名称 |
| `redis` | Redis配置 |
| `redis.host` | Redis地址 |
| `redis.port` | Redis端口 |
| `redis.password` | Redis密码 |
| `redis.db` | Redis数据库 |

### 安装依赖

```bash
npm install
```

### 同步数据库

```bash
npm run sync-sequelize
```

### 启动服务

```bash
npm run node
```
