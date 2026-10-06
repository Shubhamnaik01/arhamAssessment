const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN']

const basePrices = {
  RELIANCE: 1450.5,
  TCS: 3200.75,
  INFY: 1500.25,
  HDFCBANK: 1650,
  ICICIBANK: 1100.5,
  SBIN: 750.25,
}

const tradeCount = 3000
const firstTradeTime = Date.parse('2026-01-01T09:15:00.000Z')

export const seedTrades = Array.from({ length: tradeCount }, (_, index) => {
  const tradeNumber = index + 1
  const symbol = symbols[index % symbols.length]
  const priceChange = (index % 20) * 0.25

  return {
    tradeId: `TRD-${String(tradeNumber).padStart(4, '0')}`,
    client: `CLIENT-${String((index % 100) + 1).padStart(3, '0')}`,
    symbol,
    quantity: ((index % 20) + 1) * 5,
    price: Number((basePrices[symbol] + priceChange).toFixed(2)),
    timestamp: new Date(firstTradeTime + index * 1000).toISOString(),
  }
})
