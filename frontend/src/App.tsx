import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import AnalyticsTracker from './components/AnalyticsTracker'
import { useCurrentUser } from './hooks/useCurrentUser'
import Layout from './components/Layout'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import UserRegistrationPage from './pages/auth/UserRegistrationPage'
import ShiftsPage from './pages/admin/shifts/ShiftsPage'
import ClientsPage from './pages/admin/clients/ClientsPage'
import UsersPage from './pages/admin/users/UsersPage'
import WorkStatusesPage from './pages/admin/work-statuses/WorkStatusesPage'
import RoomsPage from './pages/admin/rooms/RoomsPage'
import RoomDetailPage from './pages/admin/rooms/RoomDetailPage'
import SettingsPage from './pages/settings/SettingsPage'
import SubscriptionPage from './pages/admin/subscription/SubscriptionPage'
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage'
import HowToUseLayout from './pages/how_to_use/HowToUseLayout'
import HowToUsePage from './pages/how_to_use/HowToUsePage'
import HowToUseRegistrationPage from './pages/how_to_use/HowToUseRegistrationPage'
import HowToUseLoginPage from './pages/how_to_use/HowToUseLoginPage'
import HowToUseShiftCreationPage from './pages/how_to_use/HowToUseShiftCreationPage'
import HowToUseAttendancePage from './pages/how_to_use/HowToUseAttendancePage'
import HowToUseChatPage from './pages/how_to_use/HowToUseChatPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ResendConfirmationPage from './pages/auth/ResendConfirmationPage'
import AccountUnlockPage from './pages/auth/AccountUnlockPage'
import UserShiftsPage from './pages/user-shifts/UserShiftsPage'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function RootRedirect() {
  const { data: user, isLoading } = useCurrentUser()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'admin' ? <Navigate to="/shifts" replace /> : <Navigate to="/user-shifts" replace />
}

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<UserRegistrationPage />} />
        <Route path="/password-reset" element={<ForgotPasswordPage />} />
        <Route path="/password-reset/edit" element={<ResetPasswordPage />} />
        <Route path="/resend-confirmation" element={<ResendConfirmationPage />} />
        <Route path="/unlock" element={<AccountUnlockPage />} />
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
        <Route path="/user-shifts" element={<PrivateLayout><UserShiftsPage /></PrivateLayout>} />
        <Route path="/settings" element={<PrivateLayout><SettingsPage /></PrivateLayout>} />
        <Route path="/two-factor-setup" element={<PrivateLayout><TwoFactorSetupPage /></PrivateLayout>} />
        <Route path="/subscription" element={<PrivateLayout><SubscriptionPage /></PrivateLayout>} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  )
}

export default App
