import EmailConfig from "../EmailConfig";

export interface ResendConfig {
  user: string
  apiKey: string
}

declare module "../EmailConfig" {
  interface EmailConfig {
    resend?: ResendConfig
  }
}

export default function() { return EmailConfig()?.resend }
