import { NextFunction, Request, Response } from "express"
import { NSAPIError } from "./NSAPIError.js"

//this is very rudimentary, in production you would use a serious persistent rate limiter

let requestCount = new Map<string, number>()
let REQUEST_LIMIT = 100
let REQUEST_LIMIT_TIME_MS = 1000 * 60

//every hour rates are reset... rate = REQUEST_LIMIT per REQUEST_LIMIT_TIME_MS
const resetInterval = setInterval(() => {
  requestCount.forEach((count, ip) => {
    if (count >= REQUEST_LIMIT) {
      requestCount.set(ip, 0)
    }
  })
}, REQUEST_LIMIT_TIME_MS) // 1 hour in milliseconds

export const requestLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //ip can be empty because of
  if (req.ip) {
    const count = requestCount.get(req.ip) || 0
    if (count >= REQUEST_LIMIT) {
      throw new NSAPIError(429, "Api Limit reached: Too many requests!")
    }
    next()
    requestCount.set(req.ip, count + 1)
  }
}
