"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, CheckCircle, Clock, Loader2 } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import type { DecisionStats } from "@/types/decision"

interface StatsGridProps {
  stats: DecisionStats
  loading?: boolean
}

export function StatsGrid({ stats, loading }: StatsGridProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glassmorphism">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Decisions Made",
      value: stats.totalDecisions,
      trend: stats.trends.decisionsThisMonth,
      trendLabel: "this month",
      icon: CheckCircle,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Satisfaction Rate",
      value: stats.satisfactionRate,
      suffix: "%",
      trend: stats.trends.satisfactionChange,
      trendLabel: "vs last month",
      icon: TrendingUp,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Active Decisions",
      value: stats.activeDecisions,
      trend: -2,
      trendLabel: "from last week",
      icon: Clock,
      gradient: "from-pink-500 to-rose-500",
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
            className="relative glassmorphism-strong group transition-all duration-300 animate-float-up overflow-hidden border-slate-700/50"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-20 group-hover:opacity-40 transition-opacity`}>
                <Icon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} duration={2500} />
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <TrendIcon
                  className={`h-3 w-3 mr-1 ${isPositiveTrend ? "text-emerald-400" : "text-red-400"} group-hover:animate-bounce-subtle`}
                />
                <span className={isPositiveTrend ? "text-emerald-400" : "text-red-400"}>
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
