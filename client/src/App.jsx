import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import NoticePage from './pages/NoticePage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      <Route path="*" element={<Navigate to="/admin/menus" replace />} />
    </Routes>
  )
}
