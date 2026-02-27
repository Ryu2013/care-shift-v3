import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getUsers } from '../api/users'
import { getTeams } from '../api/teams'
import type { User, Team } from '../types'

export default function UsersPage() {
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res) => res.data),
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', selectedTeamId],
    queryFn: () => getUsers(selectedTeamId || undefined).then((r) => r.data),
  })

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header Area */}
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate('/shifts')} className="hover:opacity-80 transition-opacity">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {teams?.find(t => t.id === selectedTeamId)?.name || '全部署'}
        </h1>
      </div>

      <div className="px-4 space-y-6 max-w-2xl mx-auto">
        {/* Team Selection */}
        <div className="flex justify-center">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}
            className="w-full max-w-xs border-2 border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-gray-700 font-medium"
          >
            <option value="">部署を変更</option>
            {teams?.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Action Bar & Toggle */}
        <div className="flex items-center justify-between gap-4">
          <button className="px-6 py-2 bg-[#5daaf5] hover:bg-[#4a90e2] text-white font-bold rounded-full shadow-md transition-all active:scale-95">
            新規招待
          </button>

          <div className="flex bg-gray-200 rounded-full p-1 shadow-inner">
            <div className="px-6 py-1.5 rounded-full text-sm font-bold bg-white text-blue-600 shadow-sm">
              従業員
            </div>
            <Link
              to="/clients"
              className="px-6 py-1.5 rounded-full text-sm font-bold transition-all text-gray-500 hover:text-gray-700"
            >
              顧客
            </Link>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 font-medium">読み込み中...</div>
          ) : users?.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium">スタッフが登録されていません</div>
          ) : (
            users?.map((user: User) => (
              <div
                key={user.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-400">名前</span>
                      <span className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-400">住所</span>
                      <span className="text-gray-600 font-medium">
                        {user.address || '未登録'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {user.role === 'admin' ? '管理者' : 'スタッフ'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
