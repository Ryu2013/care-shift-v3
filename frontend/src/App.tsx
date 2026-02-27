import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ShiftsPage from './pages/ShiftsPage'
import ClientsPage from './pages/ClientsPage'
import UsersPage from './pages/UsersPage'
import WorkStatusesPage from './pages/WorkStatusesPage'
import RoomsPage from './pages/RoomsPage'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/shifts" element={<PrivateLayout><ShiftsPage /></PrivateLayout>} />
      <Route path="/clients" element={<PrivateLayout><ClientsPage /></PrivateLayout>} />
      <Route path="/users" element={<PrivateLayout><UsersPage /></PrivateLayout>} />
      <Route path="/work-statuses" element={<PrivateLayout><WorkStatusesPage /></PrivateLayout>} />
      <Route path="/rooms" element={<PrivateLayout><RoomsPage /></PrivateLayout>} />
      <Route path="*" element={<Navigate to="/shifts" replace />} />
    </Routes>
  )
}

export default App
