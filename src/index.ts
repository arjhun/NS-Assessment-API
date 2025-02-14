import express from "express"
import { router } from "./router.js"
import { requestLimiter } from "./middleware.js"

const app = express()
const port = 3000

//limit requests made to ns api

app.use(express.json())

app.use(requestLimiter)

app.get("/*", router)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port.toString()}`)
})
