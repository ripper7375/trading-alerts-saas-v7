import type React from "react"
export interface NotificationAction {
  label: string
  url: string
}

export interface NotificationMetadata {
  symbol?: string
  timeframe?: string
  category?: string
}

export interface Notification {
  id: string
  type: "alert" | "warning" | "system" | "upgrade" | "billing"
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon?: React.ReactNode
  action?: NotificationAction
  metadata?: NotificationMetadata
}

export type NotificationTab = "All" | "Alerts" | "System" | "Unread"
