import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CreateTestPage } from '../pages/CreateTestPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EditTestCreationPage } from '../pages/EditTestCreationPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PublishNowPage } from '../pages/PublishNowPage'
import { QuestionCreationPage } from '../pages/QuestionCreationPage'
import { SchedulePublishPage } from '../pages/SchedulePublishPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/create"
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/questions"
            element={
              <ProtectedRoute>
                <QuestionCreationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/edit"
            element={
              <ProtectedRoute>
                <EditTestCreationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/publish"
            element={
              <ProtectedRoute>
                <PublishNowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/schedule"
            element={
              <ProtectedRoute>
                <SchedulePublishPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/tracking"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
