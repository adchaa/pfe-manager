import dotenv from "dotenv"
import mongoose from "mongoose"
import app from "./app"
import { env } from "./config/env"

dotenv.config()

const PORT = env.PORT || 3000

mongoose
  .connect(env.MONGODB_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log(err)
  })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(` Documentation Swagger: http://localhost:${PORT}/api-docs`)
  console.log(` JSON Swagger: http://localhost:${PORT}/api-docs/json`)
  console.log(` Modules: http://localhost:${PORT}/api-docs/modules`)
})
