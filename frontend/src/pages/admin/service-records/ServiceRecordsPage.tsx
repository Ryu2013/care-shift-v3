import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '../../../components/Header'
import { getTeams } from '../../../api/teams'
import { getClients } from '../../../api/clients'
import { getUsers } from '../../../api/users'
import { getAdminServiceRecords, updateAdminServiceRecord } from '../../../api/service_records'
import { getAdminServiceTypes } from '../../../api/service_types'
import type { Client, ServiceRecord, ServiceType, Team, User } from '../../../types'
import ServiceRecordFormModal, { type ServiceRecordFormValues } from '../../service-records/components/ServiceRecordFormModal'
import styles from './ServiceRecordsPage.module.css'

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildShiftLabel(serviceRecord: ServiceRecord) {
  return `${serviceRecord.shift.date} ${serviceRecord.shift.start_time} - ${serviceRecord.shift.end_time} / ${serviceRecord.shift.client?.name ?? '利用者未設定'}`
}

export default function ServiceRecordsPage() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(toMonthValue(new Date()))
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | ''>('')
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | undefined>(undefined)

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((response) => response.data)
  })

  const { data: clients } = useQuery({
    queryKey: ['clients', selectedTeamId],
    queryFn: () => getClients(selectedTeamId || undefined).then((response) => response.data)
  })

  const { data: users } = useQuery({
    queryKey: ['users', selectedTeamId],
    queryFn: () => getUsers(selectedTeamId || undefined).then((response) => response.data)
  })

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: () => getAdminServiceTypes().then((response) => response.data)
  })

  const recordsQuery = useQuery({
    queryKey: ['admin-service-records', month, selectedTeamId, selectedClientId, selectedUserId, selectedServiceTypeId],
    queryFn: () =>
      getAdminServiceRecords({
        date: month,
        team_id: selectedTeamId || undefined,
        client_id: selectedClientId || undefined,
        user_id: selectedUserId || undefined,
        service_type_id: selectedServiceTypeId || undefined
      }).then((response) => response.data)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<ServiceRecordFormValues> }) =>
      updateAdminServiceRecord(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-service-records'] })
      setSelectedRecord(undefined)
    }
  })

  const filteredClients = useMemo(() => {
    if (!clients) return []
    return clients
  }, [clients])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users
  }, [users])

  async function handleSave(values: ServiceRecordFormValues) {
    if (!selectedRecord) return

    await updateMutation.mutateAsync({
      id: selectedRecord.id,
      values: {
        ...values,
        note: values.note === '' ? null : values.note
      }
    })
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.content}>
        <section className={styles.filtersCard}>
          <div>
            <h1>訪問記録確認</h1>
            <p>チームと利用者ごとに、登録済みの訪問記録を確認して編集できます。</p>
          </div>

          <div className={styles.filtersGrid}>
            <label>
              <span>対象月</span>
              <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </label>

            <label>
              <span>チーム</span>
              <select
                value={selectedTeamId}
                onChange={(event) => {
                  const nextValue = event.target.value ? Number(event.target.value) : ''
                  setSelectedTeamId(nextValue)
                  setSelectedClientId('')
                  setSelectedUserId('')
                }}
              >
                <option value="">すべて</option>
                {teams?.map((team: Team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>利用者</span>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">すべて</option>
                {filteredClients.map((client: Client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>スタッフ</span>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">すべて</option>
                {filteredUsers.map((user: User) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>サービス種別</span>
              <select
                value={selectedServiceTypeId}
                onChange={(event) => setSelectedServiceTypeId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">すべて</option>
                {serviceTypes?.map((serviceType: ServiceType) => (
                  <option key={serviceType.id} value={serviceType.id}>{serviceType.name}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.listCard}>
          {recordsQuery.isLoading ? (
            <p className={styles.emptyText}>読み込み中...</p>
          ) : recordsQuery.data?.length === 0 ? (
            <p className={styles.emptyText}>この条件では訪問記録がまだありません。</p>
          ) : (
            <div className={styles.recordList}>
              {recordsQuery.data?.map((record) => (
                <article key={record.id} className={styles.recordCard}>
                  <div className={styles.recordMeta}>
                    <div>
                      <h2>{record.shift.client?.name ?? '利用者未設定'}</h2>
                      <p>{record.shift.date} {record.shift.start_time} - {record.shift.end_time}</p>
                    </div>
                    <span className={record.submitted_at ? styles.submittedBadge : styles.draftBadge}>
                      {record.submitted_at ? '提出済み' : '下書き'}
                    </span>
                  </div>

                  <dl className={styles.summaryGrid}>
                    <div>
                      <dt>チーム</dt>
                      <dd>{teams?.find((team) => team.id === record.shift.client?.team_id)?.name ?? '未設定'}</dd>
                    </div>
                    <div>
                      <dt>スタッフ</dt>
                      <dd>{record.shift.user?.name ?? '未割当'}</dd>
                    </div>
                    <div>
                      <dt>サービス種別</dt>
                      <dd>{record.service_type.name}</dd>
                    </div>
                    <div>
                      <dt>顔色</dt>
                      <dd>{record.appearance_status === 'good' ? '良' : '不良'}</dd>
                    </div>
                  </dl>

                  <p className={styles.noteText}>{record.note || '備考なし'}</p>

                  <div className={styles.recordActions}>
                    <button type="button" onClick={() => setSelectedRecord(record)}>記録を開く</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <ServiceRecordFormModal
        isOpen={selectedRecord !== undefined}
        onClose={() => setSelectedRecord(undefined)}
        onSave={(values) => handleSave(values)}
        serviceTypes={serviceTypes ?? []}
        serviceRecord={selectedRecord}
        shiftLabel={selectedRecord ? buildShiftLabel(selectedRecord) : ''}
        pending={updateMutation.isPending}
      />
    </div>
  )
}
