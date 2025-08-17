import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { Profile } from './features/profile/Profile'
import { HomePage } from './features/home/HomePage'
import { SongLogPage } from './features/songs/SongLogPage'
import { RatingPage } from './features/ratings/RatingPage'
import { SocialPage } from './features/social/SocialPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserProfile } from './features/profile/UserProfile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function AppContent() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // The logout function will clear the token and redirect to login
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
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
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <HomePage />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/log-song"
          element={
            <ProtectedRoute>
              <div>
                <header className="bg-white shadow">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <SongLogPage />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rate-songs"
          element={
            <ProtectedRoute>
              <div>
                <header className="bg-white shadow">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <RatingPage />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <div>
                <header className="bg-white shadow">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <SocialPage />
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
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <Profile />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <div>
                <header className="bg-white shadow">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">TasteBud</h1>
                      <nav className="flex items-center space-x-4">
                        <Link
                          to="/"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Home
                        </Link>
                        <Link
                          to="/log-song"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Log Song
                        </Link>
                        <Link
                          to="/rate-songs"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rate Songs
                        </Link>
                        <Link
                          to="/social"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Social
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Logout
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <UserProfile />
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
