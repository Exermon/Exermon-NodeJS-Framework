// 服务器设置
export type ServerConfig = {
  updateInterval: number

  installModules: string | string[]
  installPlugins: string | string[]

  configClearCron?: string
}

/**
 * 整体配置
 */
export interface MainConfig {
  server: ServerConfig
}

export const DefaultConfig: MainConfig = {
  "server": {
    "updateInterval": 250,

    "installModules": "all",
    "installPlugins": "all",
  },
  "http": {
    "port": 3051,
    "baseRoute": "/api"
  },
  "sequelize": {
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "",
    "database": "test"
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "password": "",
    "db": 0
  },

  "email": {
    "resend": {
      "apiKey": "",
      "user": ""
    },
    "templates": {
      "code": {
        "subject": "",
        "body": {
          "html": {
            "data": ""
          }
        }
      }
    }
  }
}
