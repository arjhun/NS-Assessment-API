import express from "express"
import { router } from "./router"
import { requestLimiter } from "./middleware"

const app = express()
const port = 3000

//limit requests made to ns api

app.use(express.json())

app.use(requestLimiter)

app.get("/*", router)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port.toString()}`)
})
