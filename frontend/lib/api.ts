import { Decision, DecisionStats, UserProfile } from '@/types/decision'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (typeof window !== 'undefined') {
    const session = await getSession()
    if (session?.user?.email) {
      const token = localStorage.getItem('authToken')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.message || 'An error occurred',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError('Network error occurred', 0, error)
  }
}

export const api = {
  auth: {
    async register(email: string, password: string) {
      const response = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response
    },

    async login(email: string, password: string) {
      const response = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response
    },

    async googleSignin(email: string, name: string, image?: string, googleId?: string) {
      const response = await fetchWithAuth('/api/auth/google-signin', {
        method: 'POST',
        body: JSON.stringify({ email, name, image, googleId }),
      })
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response
    },

    async getProfile(): Promise<{ success: boolean; data: { user: UserProfile } }> {
      return fetchWithAuth('/api/auth/profile')
    },

    logout() {
      localStorage.removeItem('authToken')
    },
  },

  decisions: {
    async create(decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { decision: Decision } }> {
      return fetchWithAuth('/api/decisions', {
        method: 'POST',
        body: JSON.stringify(decision),
      })
    },

    async getAll(params?: {
      page?: number
      limit?: number
      status?: 'draft' | 'active' | 'resolved'
      search?: string
    }): Promise<{
      success: boolean
      data: {
        decisions: Decision[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }
    }> {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      return fetchWithAuth(`/api/decisions${queryString ? `?${queryString}` : ''}`)
    },

    async getById(id: string): Promise<{ success: boolean; data: { decision: Decision } }> {
      return fetchWithAuth(`/api/decisions/${id}`)
    },

    async update(id: string, updates: Partial<Decision>): Promise<{ success: boolean; data: { decision: Decision } }> {
      return fetchWithAuth(`/api/decisions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      return fetchWithAuth(`/api/decisions/${id}`, {
        method: 'DELETE',
      })
    },

    async duplicate(id: string): Promise<{ success: boolean; data: { decision: Decision } }> {
      return fetchWithAuth(`/api/decisions/${id}/duplicate`, {
        method: 'POST',
      })
    },

    async getStats(): Promise<{ success: boolean; data: { stats: DecisionStats } }> {
      return fetchWithAuth('/api/decisions/stats')
    },
  },
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}
