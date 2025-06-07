import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { Profile } from './features/profile/Profile'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div>
                      <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                          <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Music Vibe</h1>
                            <nav className="flex items-center space-x-4">
                              <Link
                                to="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                              >
                                Home
                              </Link>
                              <Link
                                to="/profile"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                              >
                                Profile
                              </Link>
                            </nav>
                          </div>
                        </div>
                      </header>
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                          <h2 className="text-xl font-semibold text-gray-900">
                            Welcome to Music Vibe
                          </h2>
                          <p className="mt-2 text-gray-600">
                            Share your music journey with the world
                          </p>
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div>
                      <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                          <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Music Vibe</h1>
                            <nav className="flex items-center space-x-4">
                              <Link
                                to="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                              >
                                Home
                              </Link>
                              <Link
                                to="/profile"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                              >
                                Profile
                              </Link>
                            </nav>
                          </div>
                        </div>
                      </header>
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Profile />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
