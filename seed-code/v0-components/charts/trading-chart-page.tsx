import TradingChart from "@/components/trading-chart"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Professional Trading Chart</h1>
          <p className="text-muted-foreground">Real-time candlestick charts with fractal indicators</p>
        </div>

        {/* FREE Tier Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">FREE Tier</h2>
          <TradingChart tier="FREE" />
        </div>

        {/* PRO Tier Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">PRO Tier</h2>
          <TradingChart tier="PRO" />
        </div>
      </div>
    </main>
  )
}
