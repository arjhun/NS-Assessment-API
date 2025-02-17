import express from "express"
import { errorMiddleware, notFoundMiddleware } from "./error_middleware.js"
import { requestLimiter } from "./middleware.js"
import { router } from "./router.js"

const app = express()
const port = 3000

//limit requests made to ns api

app.use(express.json())

app.use(requestLimiter)

app.get("/*", router)

app.use(errorMiddleware)

app.use(notFoundMiddleware)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port.toString()}`)
})
