import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getUsers } from '../../../api/users'
import { getTeams } from '../../../api/teams'
import type { User, Team } from '../../../types'
import InviteUserModal from './components/InviteUserModal'
import UserFormModal from './components/UserFormModal'
import { Header } from '../../../components/Header'
import styles from './UsersPage.module.css'

export default function UsersPage() {
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
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
    <div className="min-h-screen">
      <Header />

      <div className={styles.container}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`${styles.pageTitle} text-xl md:text-2xl`}>
            {teams?.find(t => t.id === selectedTeamId)?.name || '全部署'}
          </h1>
        </div>

        {/* Team Selection */}
        <div className="flex justify-center mb-6">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className={`${styles.toggleWrapper} flex p-1`}>
            <div className={`${styles.toggleActive} px-6 py-1.5 text-sm`}>
              従業員
            </div>
            <Link
              to="/clients"
              className={`${styles.toggleLink} px-6 py-1.5 text-sm`}
            >
              顧客
            </Link>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className={`${styles.inviteButton} px-6 py-2`}
          >
            新規招待
          </button>
        </div>

        {/* User List */}
        <div className={styles.card}>
          <ul className={styles.userList}>
            {isLoading ? (
              <li className={`${styles.emptyState}`}>読み込み中...</li>
            ) : users?.length === 0 ? (
              <li className={`${styles.emptyState}`}>スタッフが登録されていません</li>
            ) : (
              users?.map((user: User) => (
                <li
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user)
                    setIsEditModalOpen(true)
                  }}
                  className={styles.userItem}
                >
                  <div className={styles.userInfo}>
                    <div className={styles.userIcon}>
                      {user.name.charAt(0) || '#'}
                    </div>
                    <div className={styles.userInfoContent}>
                      <div className="flex items-baseline gap-2">
                        <span className={styles.nameValue}>
                          {user.name}
                        </span>
                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.employeeBadge} text-[10px] px-2 py-0.5`}>
                          {user.role === 'admin' ? '管理者' : 'スタッフ'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={styles.addressValue}>
                          {user.address || '未登録'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent modal from opening
                        navigate(`/user-shifts?user_id=${user.id}`)
                      }}
                      className={`${styles.shiftButton} px-3 py-1 text-xs`}
                    >
                      シフト
                    </button>
                    <svg className={styles.chevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(undefined)
        }}
        onSuccess={() => refetch()}
        user={selectedUser}
      />
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  )
}
