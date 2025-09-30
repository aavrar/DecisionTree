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
      {notifications.map((notification, index) => {
        const Icon =
          notification.type === "success" ? CheckCircle : notification.type === "warning" ? AlertTriangle : XCircle

        const gradientClass =
          notification.type === "success"
            ? "from-emerald-500 to-teal-500"
            : notification.type === "warning"
              ? "from-yellow-500 to-orange-500"
              : "from-red-500 to-pink-500"

        return (
          <div
            key={notification.id}
            className="relative glassmorphism-strong px-5 py-3 rounded-xl shadow-2xl animate-slide-down flex items-center space-x-3 min-w-96 border-slate-700/50 backdrop-blur-xl"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientClass} rounded-xl blur opacity-30`} />

            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${gradientClass} relative z-10`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <span className="flex-1 text-sm text-white font-medium relative z-10">{notification.message}</span>
          </div>
        )
      })}
    </div>
  )
}
