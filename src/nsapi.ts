import "dotenv/config"
import createClient from "openapi-fetch"
import type { components, paths } from "./types/reisinformatie" // generated by openapi-typescript for type safety

type Trip = components["schemas"]["Trip"]
type TripRequest = {
  fromStation: string
  toStation: string
  dateTime?: string
}
const client = createClient<paths>({
  baseUrl: "https://gateway.apiportal.ns.nl/reisinformatie-api",
  headers: { "Ocp-Apim-Subscription-Key": process.env.APIKEY }, // https://apiportal.ns.nl/startersguide how to get your key
})

// middleware for debugging requests

client.use({
  onRequest: ({ request }) => {
    if (process.env.NODE_ENV !== "production") console.log(request)
    return request
  },
})

const BUSY_WEIGHT = 4,
  TRANSFER_WEIGHT = 1,
  FACILITY_WEIGHT = 3

// give a score of max 3 to how busy the trip is forcasted to be
export const getCrowdScore = (score?: Trip["crowdForecast"]) => {
  switch (score) {
    case "LOW":
      return 3
    case "MEDIUM":
      return 2
    case "HIGH":
      return 1
    default:
      return 0
  }
}

/**
 * Retrieves the details of a journey by its ID.
 *
 * @param {string} id - The ID of the journey.
 * @param {number} [train] - The train number (optional).
 * @param {string} [dateTime] - The date and time of the journey (optional).
 * @returns {Promise<any>} A promise that resolves to the journey details.
 */
const getJourneyDetailById = async (
  id: string,
  train?: number,
  dateTime?: string
) => {
  const { data, error } = await client.GET("/api/v2/journey", {
    params: {
      query: {
        id,
        train,
        dateTime,
      },
    },
  })
  return data
}

/**
 * Calculates the comfort score for a given trip.
 *
 * The comfort score is determined based on the facilities available on the journey,
 * the crowd forecast, and the number of transfers. The score is calculated as follows:
 * - Each unique facility on the journey adds to the score.
 * - The crowd forecast contributes to the score with a weight.
 * - The number of transfers deducts from the score.
 *
 * @param {Trip} trip - The trip for which the comfort score is calculated.
 * @returns {Promise<number>} A promise that resolves to the comfort score of the trip.
 */
const getComfortScore = async (trip: Trip): Promise<number> => {
  const facilitiesOnJourney = new Set<string>()
  // loop through each journey to find all the facilities present in train,
  // adding all the facilities to a set to get a list of all the facilities present
  for (const leg of trip.legs) {
    if (!leg.journeyDetailRef) continue
    // a journey is a separete api request
    const journey = await getJourneyDetailById(
      leg.journeyDetailRef,
      Number(leg.product?.number),
      leg.origin.plannedDateTime
    )
    // this part of the api is a little unclear to me
    // (but it was the only part that mentioned facilities)
    // should I add a dateTime to getJourneyDetail?
    journey?.payload.stops?.forEach((stop) => {
      const stock = stop.actualStock ?? stop.plannedStock
      stock?.trainParts.forEach((part) => {
        part.facilities.forEach((facility) => {
          facilitiesOnJourney.add(facility)
        })
      })
    })
  }
  // add a weight to the scores
  const busyScore = getCrowdScore(trip.crowdForecast) * BUSY_WEIGHT
  const facilityScore = facilitiesOnJourney.size * FACILITY_WEIGHT
  const transferScore = trip.transfers * TRANSFER_WEIGHT
  // return the score, transfers are deducted
  return busyScore + facilityScore - transferScore
}

/**
 * Retrieves trips from the NS API based on the provided parameters.
 *
 * @param {TripRequest} params - The parameters for the trip request.
 * @param {string} params.fromStation - The departure station.
 * @param {string} params.toStation - The destination station.
 * @param {string} [params.dateTime] - The date and time for the trip. Defaults to the current date and time if not provided.
 * @returns {Promise<Trip[] | undefined>} A promise that resolves to an array of trips or undefined if no trips are found.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getTrips = async ({
  fromStation,
  toStation,
  dateTime,
}: TripRequest): Promise<Trip[] | undefined> => {
  const { data, error } = await client.GET("/api/v3/trips", {
    params: {
      query: {
        fromStation: fromStation,
        toStation: toStation,
        //default to now
        dateTime: dateTime || new Date().toISOString(),
        //only search around departure time
        searchForArrival: false,
        //only actual stops!
        passing: false,
      },
    },
    middleware: {},
  })

  if (error) {
    console.error(error)
    throw new Error(error.message)
  }
  return data?.trips
}

/**
 * Retrieves the most optimal trip.
 *
 * @param {TripRequest} params - The parameters for the trip request.
 * @param {string} params.fromStation - The departure station.
 * @param {string} params.toStation - The destination station.
 * @param {string} [params.dateTime] - The date and time for the trip. Defaults to the current date and time if not provided.
 * @returns {Promise<Trip | undefined>} A promise that resolves to a trip or undefined if no trip is found.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getMostOptimalTrip = async ({
  fromStation,
  toStation,
  dateTime,
}: TripRequest) => {
  const trips = await getTrips({ fromStation, toStation, dateTime })
  return trips?.find((trip) => trip.optimal)
}

/**
 * Retrieves the trips sorted on most comfortable.
 *
 * @param {TripRequest} params - The parameters for the trip request.
 * @param {string} params.fromStation - The departure station.
 * @param {string} params.toStation - The destination station.
 * @param {string} [params.dateTime] - The date and time for the trip. Defaults to the current date and time if not provided.
 * @returns {Promise<Trip | undefined>} A promise that resolves to a trip or undefined if no trip is found.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getTripsByComfort = async ({
  fromStation,
  toStation,
  dateTime,
}: TripRequest) => {
  const trips = await getTrips({ fromStation, toStation, dateTime })
  if (!trips) return
  return await Promise.all(
    trips.map(async (trip) => ({
      trip,
      // add score so we can sort adter all promises are done
      score: await getComfortScore(trip),
    }))
  ).then((scoredTrips) =>
    scoredTrips
      .sort((a, b) => a.score - b.score)
      // remove score
      .map((scoredTrip) => scoredTrip.trip)
  )
}
