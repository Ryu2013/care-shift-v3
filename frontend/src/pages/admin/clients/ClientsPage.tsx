import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getClients } from '../../../api/clients'
import { getTeams } from '../../../api/teams'
import type { Client, Team } from '../../../types'
import ClientFormModal from './components/ClientFormModal'
import { Header } from '../../../components/Header'
import styles from './ClientsPage.module.css'

export default function ClientsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
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
    <div className={`${styles.page} min-h-screen`}>
      <Header />

      <div className="pt-24 px-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className={`${styles.pageTitle} text-2xl`}>
            {teams?.find(t => t.id === selectedTeamId)?.name || '部署'}
          </h1>
        </div>

        {/* Team Selection */}
        <div className="flex justify-center">
          <select
            value={selectedTeamId || ''}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            className={`${styles.teamSelect} w-full max-w-xs p-2`}
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
            className={`${styles.createButton} px-6 py-2`}
          >
            新規登録
          </button>

          <div className={`${styles.toggleWrapper} flex p-1`}>
            <Link
              to="/users"
              className={`${styles.toggleLink} px-6 py-1.5 rounded-full text-sm transition-all`}
            >
              従業員
            </Link>
            <div className={`${styles.toggleActive} px-6 py-1.5 text-sm`}>
              顧客
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className={`${styles.emptyText} text-center py-10`}>読み込み中...</div>
          ) : clients?.length === 0 ? (
            <div className={`${styles.emptyText} text-center py-10`}>利用者が登録されていません</div>
          ) : (
            clients?.map((client: Client) => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client)
                  setIsModalOpen(true)
                }}
                className={`${styles.clientCard} p-6 group`}
              >
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`${styles.metaLabel} text-xs`}>名前</span>
                    <span className={`${styles.nameValue} text-lg`}>
                      {client.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`${styles.metaLabel} text-xs`}>住所</span>
                    <span className={styles.addressValue}>
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
        client={clients?.find(c => c.id === selectedClient?.id) || selectedClient}
      />
    </div>
  )
}
