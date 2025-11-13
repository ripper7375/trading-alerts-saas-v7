import { AlertCard, type AlertCardProps } from "@/components/alert-card"

// Example data showing different alert states
const mockAlerts: AlertCardProps[] = [
  {
    id: "1",
    name: "Gold H1 Support B-B1",
    symbol: "XAUUSD",
    targetPrice: 2645.0,
    currentPrice: 2650.5,
    status: "active",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    name: "EUR/USD Daily Resistance",
    symbol: "EURUSD",
    targetPrice: 1.085,
    currentPrice: 1.0765,
    status: "paused",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    name: "Bitcoin Breakout Level",
    symbol: "BTCUSD",
    targetPrice: 98000.0,
    currentPrice: 99500.0,
    status: "triggered",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
]

export default function Page() {
  const handleViewChart = (id: string) => {
    console.log(`Opening chart for alert: ${id}`)
    // Add chart navigation logic here
  }

  const handleEdit = (id: string) => {
    console.log(`Editing alert: ${id}`)
    // Add edit modal logic here
  }

  const handleDelete = (id: string) => {
    console.log(`Deleting alert: ${id}`)
    // Add delete confirmation logic here
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Alerts</h1>
        <p className="text-gray-600 mb-8">Monitor your price targets and get notified when they're hit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              {...alert}
              onViewChart={handleViewChart}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
