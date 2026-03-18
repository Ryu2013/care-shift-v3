import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getUsers } from '../../../api/users'
import { getTeams } from '../../../api/teams'
import type { User, Team } from '../../../types'
import UserFormModal from './components/UserFormModal'
import styles from './UsersPage.module.css'

export default function UsersPage() {
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res) => res.data),
  })

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users', selectedTeamId],
    queryFn: () => getUsers(selectedTeamId || undefined).then((r) => r.data),
  })

  return (
    <div className={`${styles.page} min-h-screen`}>
      {/* Header Area */}
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate('/shifts')} className={styles.backButton}>
          <svg className={`${styles.backIcon} w-8 h-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className={`${styles.pageTitle} text-2xl`}>
          {teams?.find(t => t.id === selectedTeamId)?.name || '全部署'}
        </h1>
      </div>

      <div className="px-4 space-y-6 max-w-2xl mx-auto">
        {/* Team Selection */}
        <div className="flex justify-center">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}
            className={`${styles.teamSelect} w-full max-w-xs p-2`}
          >
            <option value="">部署を変更</option>
            {teams?.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Action Bar & Toggle */}
        <div className="flex items-center justify-between gap-4">
          <button className={`${styles.inviteButton} px-6 py-2`}>
            新規招待
          </button>

          <div className={`${styles.toggleWrapper} flex p-1`}>
            <div className={`${styles.toggleActive} px-6 py-1.5 text-sm`}>
              従業員
            </div>
            <Link
              to="/clients"
              className={`${styles.toggleLink} px-6 py-1.5 rounded-full text-sm transition-all`}
            >
              顧客
            </Link>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className={`${styles.emptyText} text-center py-10`}>読み込み中...</div>
          ) : users?.length === 0 ? (
            <div className={`${styles.emptyText} text-center py-10`}>スタッフが登録されていません</div>
          ) : (
            users?.map((user: User) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user)
                  setIsModalOpen(true)
                }}
                className={`${styles.userCard} p-6 group`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`${styles.metaLabel} text-xs`}>名前</span>
                      <span className={`${styles.nameValue} text-lg`}>
                        {user.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`${styles.metaLabel} text-xs`}>住所</span>
                      <span className={styles.addressValue}>
                        {user.address || '未登録'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.employeeBadge} text-[10px] px-2 py-0.5`}>
                      {user.role === 'admin' ? '管理者' : 'スタッフ'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent modal from opening
                        navigate(`/user-shifts?user_id=${user.id}`)
                      }}
                      className={`${styles.shiftButton} px-3 py-1 text-xs`}
                    >
                      シフト確認
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(undefined)
        }}
        onSuccess={() => refetch()}
        user={selectedUser}
      />
    </div>
  )
}
