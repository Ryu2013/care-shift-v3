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
import RoomDetailPage from './pages/RoomDetailPage'
import SettingsPage from './pages/SettingsPage'
import TwoFactorSetupPage from './pages/TwoFactorSetupPage'
import HowToUseLayout from './pages/how_to_use/HowToUseLayout'
import HowToUsePage from './pages/how_to_use/HowToUsePage'
import HowToUseRegistrationPage from './pages/how_to_use/HowToUseRegistrationPage'
import HowToUseLoginPage from './pages/how_to_use/HowToUseLoginPage'
import HowToUseShiftCreationPage from './pages/how_to_use/HowToUseShiftCreationPage'
import HowToUseAttendancePage from './pages/how_to_use/HowToUseAttendancePage'
import HowToUseChatPage from './pages/how_to_use/HowToUseChatPage'

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
      <Route path="/how-to-use" element={<HowToUseLayout />}>
        <Route index element={<HowToUsePage />} />
        <Route path="registration" element={<HowToUseRegistrationPage />} />
        <Route path="login" element={<HowToUseLoginPage />} />
        <Route path="shift-creation" element={<HowToUseShiftCreationPage />} />
        <Route path="attendance" element={<HowToUseAttendancePage />} />
        <Route path="chat" element={<HowToUseChatPage />} />
      </Route>
      <Route path="/shifts" element={<PrivateLayout><ShiftsPage /></PrivateLayout>} />
      <Route path="/clients" element={<PrivateLayout><ClientsPage /></PrivateLayout>} />
      <Route path="/users" element={<PrivateLayout><UsersPage /></PrivateLayout>} />
      <Route path="/work-statuses" element={<PrivateLayout><WorkStatusesPage /></PrivateLayout>} />
      <Route path="/rooms" element={<PrivateLayout><RoomsPage /></PrivateLayout>} />
      <Route path="/rooms/:id" element={<PrivateLayout><RoomDetailPage /></PrivateLayout>} />
      <Route path="/settings" element={<PrivateLayout><SettingsPage /></PrivateLayout>} />
      <Route path="/two-factor-setup" element={<PrivateLayout><TwoFactorSetupPage /></PrivateLayout>} />
      <Route path="*" element={<Navigate to="/shifts" replace />} />
    </Routes>
  )
}

export default App
