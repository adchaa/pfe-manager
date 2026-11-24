interface Err {
  message: string
  code: number
}

export class HttpError extends Error {
  code: number
  statusCode: number

  constructor(statusCode: number, error: Err, stack?: string) {
    super(error.message)
    this.code = error.code
    this.statusCode = statusCode
    this.stack = stack
  }
}
