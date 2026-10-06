import 'dotenv/config'
import { createServer } from 'node:http'
import express from 'express'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

new Server(httpServer)

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

