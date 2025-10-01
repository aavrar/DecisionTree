"use client"

import { LogOut, Plus, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  username?: string
  onNewDecision: () => void
  onArchived: () => void
  onLogout: () => void
  activeTab: "active" | "archived"
}

export function DashboardNav({ username, onNewDecision, onArchived, onLogout, activeTab }: DashboardNavProps) {
  return (
    <nav className="w-full bg-black border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Welcome */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">BRANCHES</h1>
          {username && (
            <span className="text-sm text-gray-400">
              WELCOME, <span className="text-white font-medium uppercase">{username}</span>
            </span>
          )}
        </div>

        {/* Center - Navigation Tabs */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onNewDecision}
            className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            NEW DECISION
          </Button>

          <Button
            onClick={onArchived}
            variant="ghost"
            className={`text-white font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 ${
              activeTab === "archived" ? "bg-white/10" : ""
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            ARCHIVED
          </Button>
        </div>

        {/* Right side - Logout */}
        <Button
          onClick={onLogout}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          LOGOUT
        </Button>
      </div>
    </nav>
  )
}
