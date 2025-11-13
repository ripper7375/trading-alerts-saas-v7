"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface AlertCardProps {
  id: string
  name: string
  symbol: string
  targetPrice: number
  currentPrice: number
  status: "active" | "paused" | "triggered"
  createdAt: string // ISO date string
  onViewChart?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

// Helper function to calculate distance percentage
const calculateDistance = (target: number, current: number) => {
  const diff = current - target
  const percent = (diff / target) * 100
  return { diff, percent }
}

// Helper function to get distance badge color
const getDistanceColor = (percent: number) => {
  const absPercent = Math.abs(percent)
  if (absPercent < 0.5) return "green"
  if (absPercent < 1.0) return "orange"
  return "red"
}

// Helper function to format relative time
const getRelativeTime = (isoDate: string) => {
  const date = new Date(isoDate)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}

export function AlertCard({
  id,
  name,
  symbol,
  targetPrice,
  currentPrice,
  status,
  createdAt,
  onViewChart,
  onEdit,
  onDelete,
}: AlertCardProps) {
  const { diff, percent } = calculateDistance(targetPrice, currentPrice)
  const distanceColor = getDistanceColor(percent)
  const relativeTime = getRelativeTime(createdAt)

  // Status badge configuration
  const statusConfig = {
    active: { emoji: "🟢", label: "Active", className: "bg-green-100 text-green-800" },
    paused: { emoji: "⏸️", label: "Paused", className: "bg-gray-100 text-gray-800" },
    triggered: { emoji: "✅", label: "Triggered", className: "bg-blue-100 text-blue-800" },
  }

  // Distance badge color classes
  const distanceColorClasses = {
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
  }

  const handleViewChart = () => {
    if (onViewChart) {
      onViewChart(id)
    } else {
      console.log(`View chart for alert: ${id}`)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id)
    } else {
      console.log(`Edit alert: ${id}`)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id)
    } else {
      console.log(`Delete alert: ${id}`)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 bg-white rounded-lg">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
          <span className="inline-flex bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{symbol}</span>
        </div>
        <Badge className={statusConfig[status].className}>
          {statusConfig[status].emoji} {statusConfig[status].label}
        </Badge>
      </div>

      {/* Card Body */}
      <div className="space-y-4">
        {/* Target Price */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Target Price</p>
          <p className="text-3xl font-bold text-gray-900">
            ${targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Current Price */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-lg font-semibold text-gray-900">
            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Distance Badge */}
        <div>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${distanceColorClasses[distanceColor]}`}
          >
            {diff >= 0 ? "+" : ""}${diff.toFixed(2)} ({percent >= 0 ? "+" : ""}
            {percent.toFixed(2)}%)
          </span>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500">Created {relativeTime}</div>
      </div>

      {/* Card Footer */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewChart}
          className="hover:scale-105 transition-transform bg-transparent"
        >
          📊 View Chart
        </Button>
        <Button variant="ghost" size="sm" onClick={handleEdit} className="hover:scale-105 transition-transform">
          ✏️ Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 hover:scale-105 transition-transform"
        >
          🗑️ Delete
        </Button>
      </div>
    </Card>
  )
}
