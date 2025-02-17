export class NSAPIError extends Error {
  code: number

  constructor(code = 500, message = "NS api error") {
    super(message)
    this.code = code
    this.name = "NSAPIError"
  }
}
