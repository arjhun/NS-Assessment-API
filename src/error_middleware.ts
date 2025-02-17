import type express from "express"
import { AppError } from "openapi-ts-router"
import { type components } from "./types/assignment"
import { NSAPIError } from "./NSAPIError"
import { NOTFOUND } from "dns"
import { Request, Response } from "express"

export function errorMiddleware(
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  const errResponse: components["schemas"]["APIError"] = {
    code: 500,
    message: "An unknown error occurred!",
    path: req.path,
    timestamp: Date.now().toString(),
  }

  // Handle application-specific errors (instances of AppError)
  if (err instanceof AppError) {
    errResponse.message = err.message
    errResponse.code = err.status
  } else if (err instanceof NSAPIError) {
    errResponse.message = `[NS API ERROR] ${err.message}`
    errResponse.code = err.code
  } else if (typeof err === "object" && err != null) {
    if ("message" in err && typeof err.message === "string") {
      errResponse.message = `Uknown error: ${err.message}`
    }
    if ("status" in err && typeof err.status === "number") {
      errResponse.code = err.status
    }
  }

  res.status(errResponse.code).json(errResponse)
}

export const notFoundMiddleware = (req: Request, res: Response) => {
  const errResponse: components["schemas"]["APIError"] = {
    code: 404,
    message: "Endpoint not found!",
    path: req.path,
    timestamp: Date.now().toString(),
  }
  res.status(404).send(errResponse)
}
