import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineNotification from './components/OfflineNotification'
import { useThemeStore } from './store/themeStore'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))

const queryClient = new QueryClient()

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#090b10]">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  useAuth()

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<Navigate to="/chat" replace />} />
        </Route>
        <Route path="/chat" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<ChatPage />} />
        </Route>
        <Route path="/quiz" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<QuizPage />} />
        </Route>
        <Route path="/exam" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<ExamPage />} />
        </Route>
        <Route path="/analytics" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<AnalyticsPage />} />
        </Route>
        <Route path="/history" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
          <Route index element={<HistoryPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('theme-light')
    } else {
      root.classList.remove('theme-light')
    }
  }, [theme])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineNotification />
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
