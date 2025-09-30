import { useState, useEffect, useCallback } from 'react'
import { api, APIError } from '@/lib/api'
import type { UserProfile } from '@/types/decision'

interface UseUserProfileResult {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.auth.getProfile()
      setProfile(response.data.user)
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : 'Failed to fetch user profile'
      setError(errorMessage)
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}
