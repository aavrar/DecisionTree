"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import type { DecisionStats } from "@/types/decision"

interface StatsGridProps {
  stats: DecisionStats
}

function useAnimatedCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}

export function StatsGrid({ stats }: StatsGridProps) {
  const animatedTotal = useAnimatedCounter(stats.totalDecisions)
  const animatedSatisfaction = useAnimatedCounter(stats.satisfactionRate)
  const animatedActive = useAnimatedCounter(stats.activeDecisions)

  const statCards = [
    {
      title: "Decisions Made",
      value: animatedTotal,
      trend: stats.trends.decisionsThisMonth,
      trendLabel: "this month",
      icon: CheckCircle,
      gradient: "gradient-success",
    },
    {
      title: "Satisfaction Rate",
      value: `${animatedSatisfaction}%`,
      trend: stats.trends.satisfactionChange,
      trendLabel: "vs last month",
      icon: TrendingUp,
      gradient: "gradient-warning",
    },
    {
      title: "Active Decisions",
      value: animatedActive,
      trend: -2,
      trendLabel: "from last week",
      icon: Clock,
      gradient: "gradient-danger",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const isPositiveTrend = stat.trend > 0
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown

        return (
          <Card
            key={index}
            className="hover-lift glassmorphism group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-float-up"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform`}
              >
                {stat.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon
                  className={`h-3 w-3 mr-1 ${isPositiveTrend ? "text-green-500" : "text-red-500"} group-hover:animate-pulse`}
                />
                <span className={isPositiveTrend ? "text-green-500" : "text-red-500"}>
                  {isPositiveTrend ? "+" : ""}
                  {stat.trend}
                </span>
                <span className="ml-1">{stat.trendLabel}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
