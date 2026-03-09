import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
