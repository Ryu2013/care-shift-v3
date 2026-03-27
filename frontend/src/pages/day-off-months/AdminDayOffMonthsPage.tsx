import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from '../../components/Header'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { getTeams } from '../../api/teams'
import { getAdminDayOffMonths } from '../../api/day-off-months'
import type { DayOffMonth, Team } from '../../types'
import styles from './AdminDayOffMonthsPage.module.css'

function toMonthValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') //getmonthは0から始まる為+１、padStartは2桁になる様に0で補完する

  return `${year}-${month}`
}

function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(dateString)) //jsのロケール機能　例："2026-03-23" → "3/23(月)"
}

function groupByTeam(dayOffMonths: DayOffMonth[] | undefined) {
  const groups = new Map<string, DayOffMonth[]>()
  const records = dayOffMonths ?? []

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    const teamName = record.user?.team_name ?? '未所属'
    const current = groups.get(teamName) ?? []
    current.push(record)
    groups.set(teamName, current)
  }

  return Array.from(groups.entries())
}

export default function AdminDayOffMonthsPage() {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const [monthValue, setMonthValue] = useState(toMonthValue(new Date()))
  const [teamId, setTeamId] = useState<number | ''>('')

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res) => res.data),
    enabled: !!currentUser
  })

  const { data: dayOffMonths, isLoading } = useQuery({
    queryKey: ['admin-day-off-months', monthValue, teamId],
    queryFn: () => getAdminDayOffMonths({ target_month: monthValue, team_id: teamId || undefined }).then((res) => res.data),
    enabled: !!currentUser
  })

  const groupedByTeam = useMemo(() => groupByTeam(dayOffMonths), [dayOffMonths])

  if (isLoadingUser) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/day-off-months" replace />

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>
        <div className={styles.heroCard}>
          <div className={styles.heroHeader}>
            <div>
              <p className={styles.eyebrow}>DAY OFF</p>
              <h1 className={styles.pageTitle}>希望休一覧</h1>
              <p className={styles.pageDescription}>部署ごとに提出された希望休を確認します。</p>
            </div>
            <div className={styles.filters}>
              <div>
                <label htmlFor="targetMonth" className={styles.fieldLabel}>対象月</label>
                <input
                  id="targetMonth"
                  type="month"
                  value={monthValue}
                  onChange={(e) => setMonthValue(e.target.value)}
                  className={styles.field}
                />
              </div>
              <div>
                <label htmlFor="teamId" className={styles.fieldLabel}>部署</label>
                <select
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : '')}
                  className={styles.field}
                >
                  <option value="">全部署</option>
                  {teams?.map((team: Team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            {isLoading ? (
              <p className={styles.statusText}>読み込み中...</p>
            ) : groupedByTeam.length === 0 ? (
              <p className={styles.statusText}>この月の希望休提出はまだありません。</p>
            ) : (
              <div className={styles.teamSections}>
                {groupedByTeam.map(([teamName, records]) => (
                  <section key={teamName} className={styles.teamSection}>
                    <div className={styles.teamHeader}>
                      <div>
                        <h2 className={styles.teamTitle}>{teamName}</h2>
                        <p className={styles.teamMeta}>{records.length}名が提出</p>
                      </div>
                    </div>
                    <div className={styles.recordsGrid}>
                      {records.map((record) => (
                        <article key={record.id} className={styles.personCard}>
                          <div className={styles.personHeader}>
                            <div>
                              <h3 className={styles.personName}>{record.user?.name}</h3>
                              <p className={styles.personMeta}>
                                提出日時: {record.submitted_at ? new Date(record.submitted_at).toLocaleString('ja-JP') : '未提出'}
                              </p>
                            </div>
                            <div className={styles.countBadge}>
                              {record.request_dates.length}日
                            </div>
                          </div>
                          <div className={styles.dateList}>
                            {record.request_dates.length > 0 ? record.request_dates.map((date) => (
                              <span key={date} className={styles.dateChip}>{formatDateLabel(date)}</span>
                            )) : <span className={styles.statusText}>希望休なし</span>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
