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
    <div className="min-h-screen">
      <Header />

      <div className={styles.container}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`${styles.pageTitle} text-xl md:text-2xl`}>
            {teams?.find(t => t.id === selectedTeamId)?.name || '部署'}
          </h1>
        </div>

        {/* Team Selection */}
        <div className="flex justify-center mb-6">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className={`${styles.toggleWrapper} flex p-1`}>
            <Link
              to="/users"
              className={`${styles.toggleLink} px-6 py-1.5 text-sm`}
            >
              従業員
            </Link>
            <div className={`${styles.toggleActive} px-6 py-1.5 text-sm`}>
              顧客
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedClient(undefined)
              setIsModalOpen(true)
            }}
            className={`${styles.createButton} px-6 py-2`}
          >
            新規登録
          </button>
        </div>

        {/* Client List */}
        <div className={styles.card}>
          <ul className={styles.clientList}>
            {isLoading ? (
              <li className={`${styles.emptyState}`}>読み込み中...</li>
            ) : clients?.length === 0 ? (
              <li className={`${styles.emptyState}`}>利用者が登録されていません</li>
            ) : (
              clients?.map((client: Client) => (
                <li
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client)
                    setIsModalOpen(true)
                  }}
                  className={styles.clientItem}
                >
                  <div className={styles.clientInfo}>
                    <div className={styles.clientIcon}>
                      {client.name.charAt(0) || '#'}
                    </div>
                    <div className={styles.clientInfoContent}>
                      <span className={styles.nameValue}>
                        {client.name}
                      </span>
                      <span className={styles.addressValue}>
                        {client.address || '未登録'}
                      </span>
                    </div>
                  </div>
                  <svg className={styles.chevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              ))
            )}
          </ul>
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
