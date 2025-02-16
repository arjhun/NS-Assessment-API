import { Router } from "express"
import { createExpressOpenApiRouter } from "openapi-ts-router"
import { zValidator } from "validation-adapters/zod"
import { components, type paths } from "./types/assignment"

import z from "zod"
import { getMostOptimalTrip, getTripsByComfort } from "./nsapi.js"

export const router: Router = Router()
export const openApiRouter = createExpressOpenApiRouter<paths>(router)

const TripRequestSchema = z.object({
  fromStation: z.string(),
  toStation: z.string(),
  dateTime: z.string().optional(),
})

openApiRouter.get("/api/v3/optimal", {
  queryValidator: zValidator(TripRequestSchema),
  handler: async (req, res) => {
    try {
      const trip = await getMostOptimalTrip(req.query)
      if (!trip) {
        res.sendStatus(404)
        return
      }
      res.status(200).send(trip)
    } catch (error) {
      res.sendStatus(500)
    }
  },
})

openApiRouter.get("/api/v3/comfort", {
  queryValidator: zValidator(TripRequestSchema),
  handler: async (req, res) => {
    try {
      const trips = await getTripsByComfort(req.query)
      if (!trips) {
        res.sendStatus(404)
        return
      }
      res.status(200).send(trips)
    } catch (error) {
      res.sendStatus(500)
    }
  },
})
