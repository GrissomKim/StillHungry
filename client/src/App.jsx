import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import NoticePage from './pages/NoticePage'
import SettingsPage from './pages/SettingsPage'
import HomePage from './pages/user/HomePage'
import ComplexPage from './pages/user/ComplexPage'
import CafeteriaPage from './pages/user/CafeteriaPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* 사용자 페이지 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/complex/:id" element={<ComplexPage />} />
      <Route path="/cafeteria/:id" element={<CafeteriaPage />} />

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
