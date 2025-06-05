import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../api/client'

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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
    try {
      const response = await apiClient.get('/auth/user/')
      setUser(response.data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await apiClient.post('/auth/login/', { email, password })
      setUser(response.data.user)
      // Store the token if your backend provides one
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
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
      // Store the token if your backend provides one
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
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