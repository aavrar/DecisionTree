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
    <Card className="glassmorphism hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Your Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Level {level}</p>
            <p className="text-2xl font-bold gradient-success bg-clip-text text-transparent">{xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Decision Streak</p>
            <p className="text-2xl font-bold gradient-warning bg-clip-text text-transparent">{streak} days</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Level {level + 1}</span>
            <span>
              {xp}/{nextLevelXp}
            </span>
          </div>
          <Progress value={(xp / nextLevelXp) * 100} className="h-2" />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Badges</p>
          <div className="flex space-x-2">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <Badge
                  key={badge.name}
                  variant={badge.earned ? "default" : "secondary"}
                  className={`flex items-center space-x-1 ${badge.earned ? "animate-pulse" : "opacity-50"}`}
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
