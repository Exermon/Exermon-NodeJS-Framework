import {PromiseUtils} from "../utils/PromiseUtils";

export function error(statusOrCode: number, codeOrMessage?: number | string, message?: string) {
  return (_errMsg?, payload?) => {
    if (typeof codeOrMessage != "number")
      throw new AppError(statusOrCode, codeOrMessage || _errMsg, payload);
    else
      throw new AppError(statusOrCode, codeOrMessage, _errMsg || message, payload);
  }
}

export const DefaultError = error(10000);

export interface ErrorData {
  status: number
  code: number
  message?: string
  payload?: any
}

export class AppError extends Error implements ErrorData {

  public status: number = 200;
  public code: number;
  public message: string;
  public payload: any;

  // constructor(status: number, code: number, message: string, payload?: object)
  // constructor(status: number, code: number, payload?: object)
  // constructor(code: number, message: string, payload?: object)
  // constructor(code: number, payload?: object)
  constructor(
    statusOrCode: number,
    codeOrMessageOrPayload?: number | string | object,
    errMsgOrPayload?: string | object, payload?: object) {
    super();
    let status: number, code: number, message: string;

    if (typeof codeOrMessageOrPayload == "number") {
      status = statusOrCode;
      code = codeOrMessageOrPayload;
    } else {
      status = 200;
      code = statusOrCode;
      if (typeof codeOrMessageOrPayload == "string")
        message = codeOrMessageOrPayload;
      else
        payload = codeOrMessageOrPayload;
    }
    if (typeof errMsgOrPayload == "string") {
      message = errMsgOrPayload
    } else {
      payload = errMsgOrPayload;
    }

    this.status = status;
    this.code = code;
    this.message = message;
    this.payload = payload;

    // this.message = `${code}: ${message}`;
  }
}

/**
 * 将函数内捕捉到的异常都转化为throwFunc所抛出的异常类型（可配置errMsg）
 * 如果捕捉到的异常是自定义异常（AppError），不转化，直接抛出，否则拦截并转换
 * 如果捕捉到的异常是字符串，直接将其作为errMsg（不指定errMsg的情况下）
 */
export function catchAsError(throwFuncOrError: Function | Error, message?: string) {
  const throwFunc = throwFuncOrError instanceof Error ?
    () => {throw throwFuncOrError} : throwFuncOrError;
  return (obj, key, desc) => {
    const oriFunc = desc.value;
    desc.value = function (...p) {
      return PromiseUtils.catcher(oriFunc.bind(this, ...p),
        e => {
          console.error("Catch", {e});
          if (e instanceof Error && e["code"]) throw e;

          message ||= typeof e == "string" ? e : e?.message;
          const data = e?.data || e;

          throwFunc(message, data);
        });
    }
  }
}
