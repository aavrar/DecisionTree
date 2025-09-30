"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Zap, Star } from "lucide-react"
import { useState, useEffect } from "react"

interface GamificationPanelProps {
  onNotification: (message: string, type?: "success" | "warning" | "error") => void
}

export function GamificationPanel({ onNotification }: GamificationPanelProps) {
  const [streak, setStreak] = useState(7)
  const [level, setLevel] = useState(3)
  const [xp, setXp] = useState(750)
  const [nextLevelXp] = useState(1000)

  const badges = [
    { name: "Decision Maker", icon: Trophy, earned: true },
    { name: "Streak Master", icon: Target, earned: true },
    { name: "AI Collaborator", icon: Zap, earned: false },
    { name: "Expert Analyst", icon: Star, earned: false },
  ]

  useEffect(() => {
    // Simulate earning XP
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setXp((prev) => {
          const newXp = prev + 10
          if (newXp >= nextLevelXp) {
            setLevel((l) => l + 1)
            onNotification("Level up! You've reached a new level!", "success")
            return newXp - nextLevelXp
          }
          return newXp
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [nextLevelXp, onNotification])

  return (
    <Card className="glassmorphism-strong hover-lift border-slate-700/50 animate-float-up">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span>Your Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Level {level}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Decision Streak</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">{streak} 🔥</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2 text-slate-300">
            <span>Progress to Level {level + 1}</span>
            <span className="font-semibold">
              {xp}/{nextLevelXp}
            </span>
          </div>
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out progress-shimmer"
              style={{ width: `${(xp / nextLevelXp) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3 text-slate-200">Badges</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <Badge
                  key={badge.name}
                  variant={badge.earned ? "default" : "secondary"}
                  className={`flex items-center space-x-1 transition-all duration-300 ${
                    badge.earned
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/50 hover:scale-110"
                      : "bg-slate-800/50 text-slate-500 border-slate-700 opacity-60"
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-xs">{badge.name}</span>
                </Badge>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
