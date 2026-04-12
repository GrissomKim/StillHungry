import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import NoticePage from './pages/NoticePage'
import SettingsPage from './pages/SettingsPage'
import SuperPage from './pages/super/SuperPage'
import HomePage from './pages/user/HomePage'
import ComplexPage from './pages/user/ComplexPage'
import CafeteriaPage from './pages/user/CafeteriaPage'

function getRole() {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).role
  } catch {
    return null
  }
}

function PrivateRoute({ children }) {
  return localStorage.getItem('accessToken') ? children : <Navigate to="/login" replace />
}

function SuperRoute({ children }) {
  return getRole() === 'SUPER_ADMIN' ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* 사용자 페이지 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/complex/:id" element={<ComplexPage />} />
      <Route path="/cafeteria/:id" element={<CafeteriaPage />} />

      {/* 슈퍼어드민 페이지 */}
      <Route
        path="/super"
        element={
          <SuperRoute>
            <SuperPage />
          </SuperRoute>
        }
      />

      {/* 어드민 페이지 */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/menus"
        element={
          <PrivateRoute>
            <MenuPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <PrivateRoute>
            <NoticePage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
