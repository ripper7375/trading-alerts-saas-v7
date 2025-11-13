"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

interface TradingChartProps {
  tier?: "FREE" | "PRO"
  initialSymbol?: string
  initialTimeframe?: string
}

const FREE_SYMBOLS = ["XAUUSD", "BTCUSD", "EURUSD", "USDJPY", "US30"]
const PRO_SYMBOLS = [
  ...FREE_SYMBOLS,
  "GBPUSD",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "USDCHF",
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
  "SPX500",
]

const FREE_TIMEFRAMES = ["H1", "H4", "D1"]
const PRO_TIMEFRAMES = ["M5", "M15", "M30", "H1", "H2", "H4", "H8", "H12", "D1"]

export default function TradingChart({
  tier = "FREE",
  initialSymbol = "XAUUSD",
  initialTimeframe = "H1",
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  const [symbol, setSymbol] = useState(initialSymbol)
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(5)
  const [nextUpdate, setNextUpdate] = useState(tier === "PRO" ? 25 : 55)

  const symbols = tier === "PRO" ? PRO_SYMBOLS : FREE_SYMBOLS
  const timeframes = tier === "PRO" ? PRO_TIMEFRAMES : FREE_TIMEFRAMES

  // Generate mock candlestick data
  const generateMockData = (basePrice = 2650) => {
    const data = []
    let time = Math.floor(Date.now() / 1000) - 50 * 3600 // 50 hours ago
    let price = basePrice

    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 10
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * 5
      const low = Math.min(open, close) - Math.random() * 5

      data.push({
        time: time as UTCTimestamp,
        open,
        high,
        low,
        close,
      })

      time += 3600 // 1 hour
      price = close
    }

    return data
  }

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#059669",
      borderDownColor: "#dc2626",
      wickUpColor: "#059669",
      wickDownColor: "#dc2626",
    })

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [])

  // Update data when symbol or timeframe changes
  useEffect(() => {
    if (!candlestickSeriesRef.current) return

    const basePrices: Record<string, number> = {
      XAUUSD: 2650,
      BTCUSD: 89000,
      EURUSD: 1.08,
      USDJPY: 149.5,
      US30: 43500,
      GBPUSD: 1.27,
      AUDUSD: 0.66,
      USDCAD: 1.39,
      NZDUSD: 0.59,
      USDCHF: 0.88,
      EURGBP: 0.85,
      EURJPY: 161.5,
      GBPJPY: 189.8,
      AUDJPY: 98.7,
      SPX500: 5900,
    }

    const data = generateMockData(basePrices[symbol] || 2650)
    candlestickSeriesRef.current.setData(data)

    // Add custom price lines
    const lastPrice = data[data.length - 1].close
    const resistancePrice = lastPrice + Math.random() * 10 + 5
    const supportPrice = lastPrice - Math.random() * 10 - 5

    candlestickSeriesRef.current.createPriceLine({
      price: resistancePrice,
      color: "#ef4444",
      lineWidth: 3,
      lineStyle: 0, // solid
      axisLabelVisible: true,
      title: "P-P1 Resistance",
    })

    candlestickSeriesRef.current.createPriceLine({
      price: supportPrice,
      color: "#10b981",
      lineWidth: 3,
      lineStyle: 0,
      axisLabelVisible: true,
      title: "B-B1 Support",
    })

    candlestickSeriesRef.current.createPriceLine({
      price: lastPrice,
      color: "#f59e0b",
      lineWidth: 2,
      lineStyle: 2, // dashed
      axisLabelVisible: true,
      title: "Current",
    })

    // Add fractal markers
    candlestickSeriesRef.current.setMarkers([
      {
        time: data[10].time,
        position: "aboveBar",
        color: "#ef4444",
        shape: "arrowDown",
        text: "▲ Peak (108)",
      },
      {
        time: data[35].time,
        position: "belowBar",
        color: "#10b981",
        shape: "arrowUp",
        text: "▼ Bottom (108)",
      },
    ])

    chartRef.current?.timeScale().fitContent()
  }, [symbol, timeframe])

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate((prev) => prev + 1)
      setNextUpdate((prev) => {
        if (prev <= 1) {
          return tier === "PRO" ? 30 : 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [tier])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdate(0)
      setNextUpdate(tier === "PRO" ? 30 : 60)
      // Trigger data refresh by updating a state
      if (candlestickSeriesRef.current) {
        const basePrices: Record<string, number> = {
          XAUUSD: 2650,
          BTCUSD: 89000,
          EURUSD: 1.08,
          USDJPY: 149.5,
          US30: 43500,
        }
        const data = generateMockData(basePrices[symbol] || 2650)
        candlestickSeriesRef.current.setData(data)
      }
    }, 500)
  }

  const handleCreateAlert = (type: "resistance" | "support") => {
    console.log(`Creating ${type} alert for ${symbol}`)
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-t-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Symbol Selector */}
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
                {tier === "FREE" && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">🔒 PRO: +10 more symbols</div>
                )}
              </SelectContent>
            </Select>

            {/* Timeframe Selector */}
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tier === "PRO" && (
                  <>
                    <SelectItem value="M5">M5</SelectItem>
                    <SelectItem value="M15">M15</SelectItem>
                    <SelectItem value="M30">M30</SelectItem>
                  </>
                )}
                <SelectItem value="H1">H1</SelectItem>
                {tier === "PRO" && <SelectItem value="H2">H2</SelectItem>}
                <SelectItem value="H4">H4</SelectItem>
                {tier === "PRO" && (
                  <>
                    <SelectItem value="H8">H8</SelectItem>
                    <SelectItem value="H12">H12</SelectItem>
                  </>
                )}
                <SelectItem value="D1">D1</SelectItem>
                {tier === "FREE" && <div className="px-2 py-1.5 text-xs text-muted-foreground">🔒 PRO for M5-H12</div>}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            {tier === "PRO" && <Badge className="bg-amber-500 hover:bg-amber-600 text-white">⚡ 30s updates</Badge>}
          </div>

          {/* Update Status */}
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate}s ago | Next: {nextUpdate}s
            {tier === "FREE" && <div className="text-xs text-muted-foreground mt-1">Updates every 60s</div>}
          </div>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div
        ref={chartContainerRef}
        id="trading-chart-container"
        className="w-full bg-white border border-gray-200 rounded-lg"
        style={{ height: "500px", minHeight: "400px" }}
      />

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Resistance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">🔴 Horizontal Resistance (P-P1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">${(2650 + 5.2).toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">5 touches | 8.5° | 120 bars</div>
              <div className="text-xs text-gray-500 mt-1">+$4.70 (+0.18%)</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleCreateAlert("resistance")} className="w-full">
              Create Alert
            </Button>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🟢 Horizontal Support (B-B1)
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white ml-auto">⚠️ NEAR</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">${(2650 - 5.0).toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">4 touches | -1.2° | 100 bars</div>
              <div className="text-xs text-gray-500 mt-1">-$5.50 (-0.21%)</div>
            </div>
            <Button
              size="sm"
              onClick={() => handleCreateAlert("support")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Create Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      {tier === "FREE" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            🔒 <strong>Upgrade to PRO</strong> for M5-H12 timeframes, 15 symbols, and 30s updates
          </p>
        </div>
      )}
    </div>
  )
}
