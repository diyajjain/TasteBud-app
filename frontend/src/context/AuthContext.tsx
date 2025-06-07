import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../api/client'

interface User {
  id: number
  username: string
  email: string
  favorite_genres: string[]
  favorite_artists: string[]
  mood_preferences: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updatePreferences: (preferences: {
    favorite_genres?: string[]
    favorite_artists?: string[]
    mood_preferences?: string[]
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.get('/auth/user/')
      setUser(response.data)
    } catch (err) {
      setUser(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await apiClient.post('/auth/login/', { email, password })
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null)
      const response = await apiClient.post('/auth/register/', {
        username,
        email,
        password,
      })
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
      throw err
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout/')
      setUser(null)
      localStorage.removeItem('token')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed')
      throw err
    }
  }

  const updatePreferences = async (preferences: {
    favorite_genres?: string[]
    favorite_artists?: string[]
    mood_preferences?: string[]
  }) => {
    try {
      setError(null)
      const response = await apiClient.put('/auth/user/', preferences)
      setUser(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences')
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setUser,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 