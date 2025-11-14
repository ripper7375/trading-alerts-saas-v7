"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BillingPageProps {
  tier?: "FREE" | "PRO"
  subscriptionStatus?: "active" | "trial" | "canceled"
}

export default function BillingPage({ tier = "PRO", subscriptionStatus = "active" }: BillingPageProps) {
  // Mock billing history data
  const billingHistory = [
    {
      date: "Feb 15, 2025",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "Paid",
    },
    {
      date: "Jan 15, 2025",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "Paid",
    },
    {
      date: "Dec 15, 2024",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "Paid",
    },
  ]

  // Usage statistics data
  const usageStats = [
    {
      label: "Alerts",
      used: 8,
      total: 20,
      percentage: 40,
      color: "bg-green-500",
    },
    {
      label: "Watchlist Items",
      used: 12,
      total: 50,
      percentage: 24,
      color: "bg-blue-500",
    },
    {
      label: "API Calls (Peak Hour)",
      used: 245,
      total: 300,
      percentage: 82,
      color: "bg-yellow-500",
      warning: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">Dashboard &gt; Settings &gt; Billing</div>

        {/* Page Header */}
        <h1 className="text-3xl font-bold mb-2">💳 Billing & Subscription</h1>
        <p className="text-gray-600 mb-8">Manage your plan and payment methods</p>

        {/* Current Plan Card - Gradient */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl mb-8 border-0">
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 text-white rounded-full px-4 py-2 hover:bg-white/20">PRO TIER ⭐</Badge>
              <Badge className="bg-white/20 text-white rounded-full px-4 py-2 hover:bg-white/20">✓ ACTIVE</Badge>
            </div>

            <h2 className="text-4xl font-bold mt-4">Pro Plan</h2>
            <div className="text-5xl font-bold mt-2">$29/month</div>
            <div className="text-xl text-white/90 mt-2">Renews on Feb 15, 2025</div>
            <div className="text-lg text-white/80">Member since Jan 15, 2025</div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>10 Symbols</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>9 Timeframes (M5-D1)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>20 Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>50 Watchlist Items</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Email & Push Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>300 API Requests/hour</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">💳 Payment Method</h2>
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">💳</div>
                  <div>
                    <div className="text-xl font-semibold">Visa ending in ****4242</div>
                    <div className="text-sm text-gray-600">Expires: 12/2026</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-blue-600 bg-transparent"
                  onClick={() => console.log("Update card clicked")}
                >
                  Update Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Statistics */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">📊 Usage This Month</h2>
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                {usageStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{stat.label}</span>
                        {stat.warning && <span className="text-xs text-orange-600">⚠️ High usage</span>}
                      </div>
                      <span className="text-2xl font-bold">
                        {stat.used}/{stat.total}
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-4" />
                    <div className="text-sm text-gray-600 mt-1">{stat.percentage}% used</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Billing History */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">📄 Billing History</h2>
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((row, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{row.status} ✓</Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => console.log(`Download invoice for ${row.date}`)}
                          >
                            [Download PDF]
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-sm text-gray-600 mt-4 flex items-center justify-between">
                <span>Page 1 of 3</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log("Previous page")}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log("Next page")}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Subscription Actions */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">⚙️ Manage Subscription</h2>
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Switch to Annual */}
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="text-lg font-semibold mb-2">Switch to Annual</h3>
                  <p className="text-sm text-gray-600 mb-4">Save $58/year by switching</p>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={() => console.log("Switch to annual clicked")}
                  >
                    Switch to Annual
                  </Button>
                </div>

                {/* Pause Subscription */}
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">⏸️</div>
                  <h3 className="text-lg font-semibold mb-2">Pause Subscription</h3>
                  <p className="text-sm text-gray-600 mb-4">Take a break for up to 3 months</p>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-yellow-500 bg-transparent"
                    onClick={() => console.log("Pause subscription clicked")}
                  >
                    Pause
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Downgrade Section */}
        <Card className="bg-gray-50 border-2 border-gray-300 rounded-xl mt-12">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Want to downgrade?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Switch to FREE tier anytime. You&apos;ll keep your data but lose PRO features.
            </p>
            <div className="text-sm text-orange-600 space-y-1 mb-6">
              <div>⚠️ Limited to 5 symbols (currently: 10)</div>
              <div>⚠️ Only 3 timeframes (currently: 9)</div>
              <div>⚠️ Only 5 alerts (currently: 20)</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => console.log("Keep PRO plan clicked")}
              >
                Keep PRO Plan
              </Button>
              <Button
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 bg-transparent"
                onClick={() => console.log("Downgrade to FREE clicked")}
              >
                Downgrade to FREE
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
