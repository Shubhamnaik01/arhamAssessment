import { useEffect, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

function App() {
  const [trades, setTrades] = useState([])
  const [pullInProgress, setPullInProgress] = useState(false)
  const [lastCompletedAt, setLastCompletedAt] = useState(null)
  const [lastPullError, setLastPullError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let hasConnected = false
    const socket = io()

    const loadTradeState = async (errorMessage) => {
      try {
        const response = await axios.get('/api/trades')

        if (!isMounted) return

        setTrades(response.data.trades)
        setPullInProgress(response.data.pullInProgress)
        setLastCompletedAt(response.data.lastCompletedAt)
        setLastPullError(response.data.lastPullError)
      } catch {
        if (isMounted) {
          setLastPullError(errorMessage)
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false)
        }
      }
    }

    const handlePullStarted = () => {
      setPullInProgress(true)
      setLastPullError(null)
    }

    const handleSocketConnect = () => {
      if (hasConnected) {
        loadTradeState('Unable to refresh trades after reconnecting.')
      }

      hasConnected = true
    }

    const handlePullCompleted = () => {
      setPullInProgress(false)
      loadTradeState('Unable to refresh trades after the pull completed.')
    }

    const handlePullFailed = (event) => {
      setPullInProgress(false)
      setLastPullError(event.message)
      loadTradeState(event.message)
    }

    socket.on('connect', handleSocketConnect)
    socket.on('pull-started', handlePullStarted)
    socket.on('pull-completed', handlePullCompleted)
    socket.on('pull-failed', handlePullFailed)

    loadTradeState('Unable to load trades. Please try again.')

    return () => {
      isMounted = false
      socket.off('connect', handleSocketConnect)
      socket.off('pull-started', handlePullStarted)
      socket.off('pull-completed', handlePullCompleted)
      socket.off('pull-failed', handlePullFailed)
      socket.disconnect()
    }
  }, [])

  const handlePullTrades = async () => {
    setLastPullError(null)
    setPullInProgress(true)

    try {
      await axios.post('/api/pull')
    } catch (error) {
      if (error.response?.status === 409) {
        setLastPullError('A trade pull is already in progress.')
        return
      }

      setPullInProgress(false)
      setLastPullError('Unable to start the trade pull. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trades Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Latest successfully pulled BSE trades
            </p>
          </div>

          <button
            type="button"
            onClick={handlePullTrades}
            disabled={initialLoading || pullInProgress}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {pullInProgress ? 'Pulling...' : 'Pull Trades'}
          </button>
        </header>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Current status</p>
            <p className="mt-1 font-semibold">
              {pullInProgress ? 'Pull in progress' : 'Idle'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Trade count</p>
            <p className="mt-1 font-semibold">{trades.length.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Last completed</p>
            <p className="mt-1 font-semibold">
              {lastCompletedAt
                ? new Date(lastCompletedAt).toLocaleString()
                : 'No successful pull yet'}
            </p>
          </div>
        </section>

        {lastPullError && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {lastPullError}
          </p>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Trades</h2>
          </div>

          {initialLoading ? (
            <p className="px-5 py-10 text-center text-slate-500">
              Loading trades...
            </p>
          ) : trades.length === 0 ? (
            <p className="px-5 py-10 text-center text-slate-500">
              No trades have been pulled yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Trade ID</th>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Symbol</th>
                    <th className="px-5 py-3 text-right font-semibold">Quantity</th>
                    <th className="px-5 py-3 text-right font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trades.map((trade) => (
                    <tr key={trade.tradeId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 font-medium">
                        {trade.tradeId}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">{trade.client}</td>
                      <td className="whitespace-nowrap px-5 py-3">{trade.symbol}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        {trade.quantity}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        ₹{Number(trade.price).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {new Date(trade.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
