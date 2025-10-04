"use client"

import { LogOut, Plus, Archive, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface DashboardNavProps {
  username?: string
  onNewDecision: () => void
  onArchived: () => void
  onHelp: () => void
  onLogout: () => void
  activeTab: "active" | "archived"
}

export function DashboardNav({ username, onNewDecision, onArchived, onHelp, onLogout, activeTab }: DashboardNavProps) {
  return (
    <nav className="w-full bg-black border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Welcome */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Branches Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-white tracking-wide">BRANCHES</h1>
          </div>
          {username && (
            <span className="text-sm text-gray-400">
              WELCOME, <span className="text-white font-medium uppercase">{username}</span>
            </span>
          )}
        </div>

        {/* Center - Navigation Tabs */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewDecision}
                className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                NEW BRANCH
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new decision from a template</p>
            </TooltipContent>
          </Tooltip>

          {activeTab === "active" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onArchived}
                  variant="ghost"
                  className="text-white font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  ARCHIVED
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View archived decisions (auto-deleted after 7 days)</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onArchived}
                  variant="ghost"
                  className="bg-white/10 text-white font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/20"
                >
                  ACTIVE BRANCHES
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Return to active decisions</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Right side - Help & Logout */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onHelp}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                HELP
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn how to use Branches</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                LOGOUT
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </nav>
  )
}
