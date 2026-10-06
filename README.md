# Arham Assessments

This repository contains a small trade dashboard assessment built with React and Express.

## Current functionality

The current phase contains:

- A Vite React client with Tailwind CSS
- An Express server with Socket.IO initialized
- A basic `GET /api/health` endpoint
- A delayed mock BSE `GET /getTrades` endpoint with 3,000 seeded trades

## Run the client

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` by default.

## Run the server

```bash
cd server
npm install
npm run dev
```

The server runs at `http://localhost:3000` by default. Set `PORT` in a local `.env` file to use a different port.

Copy `server/.env.example` to `server/.env` to configure the mock BSE delay. `BSE_DELAY_MS` defaults to 5,000 milliseconds when it is missing or invalid and can be set to `900000` to simulate a 15-minute pull.
