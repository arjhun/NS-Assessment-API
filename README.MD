# NS Assignment Full Stack Developer (Typescript)

My assessment assignment for the position of full stack developer @ NS

## Table of Contents

- [NS Assignment Full Stack Developer (Typescript)](#ns-assignment-full-stack-developer-typescript)
  - [Table of Contents](#table-of-contents)
  - [Focus and scope](#focus-and-scope)
  - [Endpoints](#endpoints)
  - [Local build testing](#local-build-testing)
  - [Production](#production)
  - [Out of scope improvements](#out-of-scope-improvements)
  - [Dependencies](#dependencies)
  - [Dev Dependencies](#dev-dependencies)
  
## Focus and scope
because of the scope of the project and limited time I picked the following topics as a focus for this assignment:
    - Type safety (TypeScript)
    - Type safe implementation of the NS OpenApi Spec
    - Type safe implementation of my own OpenAPI spec
    - Request Schema validation 
    - Rate Limiting (small example)
    - Project structuring
    - Cloud agnostic deployment through docker 
    - Documentation

## Endpoints
1. Provides the optimal trip between two train stations based on the
inputs.

    ``` GET /api/v3/optimal[?fromStation][&toStaion][&dateTime]```

2. Provides a list of trips between two train stations based on the
inputs sorted on comfort. Comfort is based on:
   - Amount of transfers
   - How busy the train is
   - How many facilities the train has (WiFi, Stilte coupe, etc)

    ``` GET /api/v3/comfort[?fromStation][&toStaion][&dateTime]```

Query params:

`fromStation `(required) station full name
`fromStation` (required) station full name
`dateTime` (optional) Date time string in ISO8610 format server time if undefined

## Local build testing 

1. Clone this repository
2. If any changes were made to the schema regenerate types `npm run generate-types` This will run `npx openapi-typescript` and convert the open api specs in the openapi folder to typescript types
3. Make sure you gave a subscription key in the ns portal for the product ['Reisinformatie API'](https://apiportal.ns.nl/startersguide) add this key as a enviroment variable `APIKEY="12345457856341323442423234234"`
   - locally: though a .env file
   - production: docker enviroment variable e.a.
4. `npm install`
5. Run tsc in --watch mode `npm run dev`

## Production

1. Build the container in your cloud environment or locally
   
   ```
   docker build -t ns-assignment-api:latest .    
   ```
2. run the container though your preferred docker runtime method make sure the port and `APIKEY` are set as an environment variable or docker secret
   
   ```
   docker run --rm --name ns-assignment-api -d -p 3000:3000 -e APIKEY="your_api_key" ns-assignment-api:latest
   ```

3.   Go to http://localhost:3000 or your cloud instance url and start using the api endpoints

## Out of scope improvements

- Proper error handling everywhere
- API Authentication
- OPENAPI Schema explore page
- Proper unit testing through vitest
- Use AWS API Gateway and AWS Lambda

## Dependencies

- `dotenv` .env variable parsing 
- `express` webserver for api endpoints
- `openapi-ts-router` typesafe endpoints based on OpenAPI Spec
- `validation-adapters` and `zod` adapters for request schema 

## Dev Dependencies

- `openapi-fetch` A thin layer over the fetch command to fetch typesafe way from an OpenAPI spec
- `typescript`
- `vitest` Super fast unit and coverage testing 
