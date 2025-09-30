"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Clock, CheckCircle, FileText, Loader2 } from 'lucide-react'
import type { Decision } from '@/types/decision'
import { formatDistanceToNow } from 'date-fns'

interface DecisionHistoryListProps {
  decisions: Decision[]
  loading?: boolean
  onView?: (decision: Decision) => void
  onEdit?: (decision: Decision) => void
  onDelete?: (id: string) => void
}

export function DecisionHistoryList({
  decisions,
  loading,
  onView,
  onEdit,
  onDelete
}: DecisionHistoryListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-3 w-3" />
      case 'active': return <Clock className="h-3 w-3" />
      case 'resolved': return <CheckCircle className="h-3 w-3" />
      default: return null
    }
  }

  if (loading) {
    return (
      <Card className="glassmorphism-strong border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-slate-700/30 rounded-lg bg-slate-800/30">
                <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-slate-700/50 animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-700/50 animate-pulse rounded"></div>
                  <div className="h-8 w-full bg-slate-700/50 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (decisions.length === 0) {
    return (
      <Card className="glassmorphism-strong border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No decisions yet</h3>
            <p className="text-sm text-slate-400">
              Create your first decision to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism-strong hover-lift animate-float-up border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-400" />
            Recent Decisions
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">{decisions.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {decisions.map((decision, index) => (
            <div
              key={decision.id}
              className="p-4 border border-slate-700/30 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer group animate-float-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm truncate text-white group-hover:text-blue-300 transition-colors">
                      {decision.title}
                    </h4>
                    <Badge className={`${getStatusColor(decision.status)} flex items-center gap-1 text-xs`}>
                      {getStatusIcon(decision.status)}
                      {decision.status}
                    </Badge>
                  </div>

                  {decision.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {decision.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {decision.factors?.length || 0} factors
                    </span>
                    {decision.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(decision)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(decision)
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this decision?')) {
                          onDelete(decision.id)
                        }
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
