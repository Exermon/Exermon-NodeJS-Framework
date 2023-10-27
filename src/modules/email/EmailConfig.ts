import {config} from "../../config/ConfigManager";

export enum EmailType {
  Code = "code", Welcome = "welcome", Benefit = "benefit"
}

export interface EmailConfig {
  whitelist?: string[]
  templates: {
    [K in EmailType]?: {
      subject: string | {
        data: string
      },
      body: string | {
        html: {
          data: string
        }
      }
    }
  }
}

declare module "../../config/ConfigType" {
  interface MainConfig {
    email?: EmailConfig
  }
}

export default function() { return config().email }
