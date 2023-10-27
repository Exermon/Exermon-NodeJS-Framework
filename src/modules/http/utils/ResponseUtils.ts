/**
 * 基础响应
 */
export class BaseResponse<T = any> {
  public code: number = 200
  public reason: string = "success"
  public payload?: T

  constructor();

  constructor(payload: T);
  constructor(code: number | T, payload?: T);
  constructor(code: number, reason: string, payload?: T);
  constructor(a: number | T = 200, b?: string | T, c?: T) {
    if (typeof a === "number") {
      this.code = a;
      if (typeof b === "string") {
        this.reason = b;
        this.payload = c;
      } else
        this.payload = b;
    } else
      this.payload = a;
  }
}

export class SuccessResponse<T = any> extends BaseResponse<T> {
  constructor(payload?: T) { super(200, "success", payload); }
}
export class NoJsonResponse<T = any> extends BaseResponse<T> {
  constructor(payload?: T) { super(payload); }
}
export class PrueResponse<T = any> extends BaseResponse<T> {
  constructor(payload: T);
  constructor(code: number, payload?: T);
  constructor(a: number | T, b?: T) { super(a, b); }
}

/**
 * 基础异常
 */
export class BaseError<T = any> extends BaseResponse<T> implements Error {

  constructor(payload: T);
  constructor(code: number, reason: string, payload?: T)
  constructor(a: number | T = 500, b = "Bad Error", c?: T) {
    if (typeof a !== "number") super(500, "Bad Error", a);
    else super(a, b, c);
  }

  public get message() { return `${this.code}: ${this.reason}` }
  public get name() { return this.code.toString() }
}

export class DatabaseError extends BaseError<{error: any}> {
  constructor(error: any) {
    super(500, "Database error", {error});
  }
}

export class NotFoundError extends BaseError<{resourceName: string}> {
  constructor(resourceName: string, payload?: any) {
    super(404, `${resourceName} NOT FOUND`, {resourceName, ...payload});
  }
}

export class ExistError extends BaseError<{resourceName: string}> {
  constructor(resourceName: string, payload?: any) {
    super(500, `${resourceName} EXIST`, {resourceName, ...payload});
  }
}

export class OAError extends BaseError {
  constructor() {
    super(501, "OAth Server Error");
  }
}

export class AuthError extends BaseError {
  constructor(payload?) {
    super(403, "Bad Signature", payload);
  }
}

/**
 * 检查件报错，若不符合检查件条件则抛出该错误
 * */
export class RequireError extends BaseError{
  constructor() {
    super(507, "Require Error");
  }
}
