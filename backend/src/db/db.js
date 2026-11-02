import dns from "node:dns"
import mongoose from "mongoose"

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"])
}

let connectionPromise

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is required")
    }

    connectionPromise = mongoose.connect(uri)
      .then((connection) => {
        console.log("Connected to DB")
        return connection
      })
      .finally(() => {
        connectionPromise = undefined
      })
  }

  return connectionPromise
}

export default connectDB