import { useState, useEffect, useCallback } from 'react'
import { api, APIError } from '@/lib/api'
import type { Decision, DecisionStats } from '@/types/decision'

interface UseDecisionsResult {
  decisions: Decision[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Decision | null>
  updateDecision: (id: string, updates: Partial<Decision>) => Promise<Decision | null>
  deleteDecision: (id: string) => Promise<boolean>
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface UseDecisionsOptions {
  page?: number
  limit?: number
  status?: 'draft' | 'active' | 'resolved'
  search?: string
  autoFetch?: boolean
}

export function useDecisions(options: UseDecisionsOptions = {}): UseDecisionsResult {
  const { page = 1, limit = 10, status, search, autoFetch = true } = options

  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchDecisions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.decisions.getAll({ page, limit, status, search })

      setDecisions(response.data.decisions)
      setPagination(response.data.pagination)
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to fetch decisions'
      setError(errorMessage)
      console.error('Error fetching decisions:', err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, status, search])

  useEffect(() => {
    if (autoFetch) {
      fetchDecisions()
    }
  }, [fetchDecisions, autoFetch])

  const createDecision = useCallback(async (
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Decision | null> => {
    try {
      const response = await api.decisions.create(decision)
      await fetchDecisions()
      return response.data.decision
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to create decision'
      setError(errorMessage)
      console.error('Error creating decision:', err)
      return null
    }
  }, [fetchDecisions])

  const updateDecision = useCallback(async (
    id: string,
    updates: Partial<Decision>
  ): Promise<Decision | null> => {
    try {
      const response = await api.decisions.update(id, updates)
      await fetchDecisions()
      return response.data.decision
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to update decision'
      setError(errorMessage)
      console.error('Error updating decision:', err)
      return null
    }
  }, [fetchDecisions])

  const deleteDecision = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.decisions.delete(id)
      await fetchDecisions()
      return true
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to delete decision'
      setError(errorMessage)
      console.error('Error deleting decision:', err)
      return false
    }
  }, [fetchDecisions])

  return {
    decisions,
    loading,
    error,
    refetch: fetchDecisions,
    createDecision,
    updateDecision,
    deleteDecision,
    pagination,
  }
}

interface UseDecisionResult {
  decision: Decision | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDecision(id: string | null): UseDecisionResult {
  const [decision, setDecision] = useState<Decision | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDecision = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.decisions.getById(id)
      setDecision(response.data.decision)
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to fetch decision'
      setError(errorMessage)
      console.error('Error fetching decision:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDecision()
  }, [fetchDecision])

  return {
    decision,
    loading,
    error,
    refetch: fetchDecision,
  }
}

interface UseDecisionStatsResult {
  stats: DecisionStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDecisionStats(): UseDecisionStatsResult {
  const [stats, setStats] = useState<DecisionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.decisions.getStats()
      setStats(response.data.stats)
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to fetch statistics'
      setError(errorMessage)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
