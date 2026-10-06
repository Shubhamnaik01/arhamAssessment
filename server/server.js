import 'dotenv/config'
import { createServer } from 'node:http'
import axios from 'axios'
import express from 'express'
import { Server } from 'socket.io'
import { seedTrades } from './data/seedTrades.js'

const app = express()
const httpServer = createServer(app)

new Server(httpServer)

const port = process.env.PORT || 3000
const bseApiUrl =
  process.env.BSE_API_URL || `http://127.0.0.1:${port}`

let pulledTrades = []
let pullInProgress = false
let lastCompletedAt = null
let lastPullError = null

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const pullTradesFromBse = async () => {
  try {
    const response = await axios.get(`${bseApiUrl}/getTrades`, { timeout: 0 })

    pulledTrades = response.data
    lastCompletedAt = new Date().toISOString()
    lastPullError = null
  } catch {
    lastPullError = 'Unable to pull trades from BSE'
  } finally {
    pullInProgress = false
  }
}

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/trades', (request, response) => {
  response.json({
    trades: pulledTrades,
    pullInProgress,
    lastCompletedAt,
    lastPullError,
  })
})

app.post('/api/pull', (request, response) => {
  if (pullInProgress) {
    return response.status(409).json({
      message: 'A trade pull is already in progress',
    })
  }

  pullInProgress = true
  lastPullError = null

  // Start the pull without waiting so this request can return immediately.
  pullTradesFromBse()

  return response.status(202).json({
    message: 'Trade pull started',
  })
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

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
