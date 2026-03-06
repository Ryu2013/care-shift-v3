import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getClients } from '../api/clients'
import { getTeams } from '../api/teams'
import type { Client, Team } from '../types'
import ClientFormModal from '../components/ClientFormModal'
import { Header } from '../components/Header'

export default function ClientsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res) => res.data),
  })

  // Set initial team if none selected
  useEffect(() => {
    if (teams && teams.length > 0 && selectedTeamId === undefined) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams, selectedTeamId])

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients', selectedTeamId],
    queryFn: () => getClients(selectedTeamId).then((r) => r.data),
    enabled: selectedTeamId !== undefined
  })

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />

      <div className="pt-24 px-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {teams?.find(t => t.id === selectedTeamId)?.name || '部署'}
          </h1>
        </div>

        {/* Team Selection */}
        <div className="flex justify-center">
          <select
            value={selectedTeamId || ''}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            className="w-full max-w-xs border-2 border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-gray-700 font-medium"
          >
            {teams?.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Action Bar & Toggle */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedClient(undefined)
              setIsModalOpen(true)
            }}
            className="px-6 py-2 bg-[#5daaf5] hover:bg-[#4a90e2] text-white font-bold rounded-full shadow-md transition-all active:scale-95"
          >
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
                onClick={() => {
                  setSelectedClient(client)
                  setIsModalOpen(true)
                }}
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

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(undefined)
        }}
        onSuccess={() => refetch()}
        initialTeamId={selectedTeamId === undefined ? '' : selectedTeamId}
        client={selectedClient}
      />
    </div>
  )
}

