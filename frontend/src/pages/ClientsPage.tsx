import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getClients } from '../api/clients'
import { getTeams } from '../api/teams'
import type { Client, Team } from '../types'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res) => res.data),
  })

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', selectedTeamId],
    queryFn: () => getClients(selectedTeamId || undefined).then((r) => r.data),
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
            新規登録
          </button>

          <div className="flex bg-gray-200 rounded-full p-1 shadow-inner">
            <Link
              to="/users"
              className="px-6 py-1.5 rounded-full text-sm font-bold transition-all text-gray-500 hover:text-gray-700"
            >
              従業員
            </Link>
            <div className="px-6 py-1.5 rounded-full text-sm font-bold bg-white text-blue-600 shadow-sm">
              顧客
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 font-medium">読み込み中...</div>
          ) : clients?.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium">利用者が登録されていません</div>
          ) : (
            clients?.map((client: Client) => (
              <div
                key={client.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-gray-400">名前</span>
                    <span className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">
                      {client.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-gray-400">住所</span>
                    <span className="text-gray-600 font-medium">
                      {client.address || '未登録'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
