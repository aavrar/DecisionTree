"use client"

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface Notification {
  id: number
  message: string
  type: "success" | "warning" | "error"
}

interface NotificationSystemProps {
  notifications: Notification[]
}

export function NotificationSystem({ notifications }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon =
          notification.type === "success" ? CheckCircle : notification.type === "warning" ? AlertTriangle : XCircle

        return (
          <div
            key={notification.id}
            className={`glassmorphism px-4 py-3 rounded-lg shadow-lg animate-slide-down flex items-center space-x-2 min-w-80 ${
              notification.type === "success"
                ? "border-green-500/20"
                : notification.type === "warning"
                  ? "border-yellow-500/20"
                  : "border-red-500/20"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                notification.type === "success"
                  ? "text-green-500"
                  : notification.type === "warning"
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            />
            <span className="flex-1 text-sm">{notification.message}</span>
          </div>
        )
      })}
    </div>
  )
}
