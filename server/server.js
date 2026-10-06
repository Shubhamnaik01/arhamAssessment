import 'dotenv/config'
import { createServer } from 'node:http'
import express from 'express'
import { Server } from 'socket.io'
import { seedTrades } from './data/seedTrades.js'

const app = express()
const httpServer = createServer(app)

new Server(httpServer)

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/getTrades', async (request, response) => {
  const configuredDelay = Number(process.env.BSE_DELAY_MS)
  const bseDelayMs =
    Number.isFinite(configuredDelay) && configuredDelay >= 0
      ? configuredDelay
      : 5000

  await delay(bseDelayMs)

  response.json(seedTrades)
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
