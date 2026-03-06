import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/rails-api'
import { Header } from '../components/Header'
import styles from './WorkStatusesPage.module.css'

export default function WorkStatusesPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const { data, isLoading } = useQuery({
    queryKey: ['workStatuses', date],
    queryFn: () => apiClient.get('/admin/work_statuses', { params: { date } }).then((r) => r.data),
  })

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-28 pb-8 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className={`${styles.container} p-6 sm:p-10`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className={`${styles.title} text-2xl`}>勤務状況</h1>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${styles.input} px-4 py-2 text-sm w-full sm:w-auto`}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <span className={`${styles.statusBadge} ${styles.statusBadgeWork} px-4 py-2`}>出勤: {data?.work_count}</span>
                <span className={`${styles.statusBadge} ${styles.statusBadgeNotWork} px-4 py-2`}>未出勤: {data?.not_work_count}</span>
              </div>

              {data?.shifts?.length === 0 ? (
                <div className={`${styles.card} p-8`}>
                  <p className={`${styles.emptyText}`}>指定された日付のシフトはありません。</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.shifts?.map((s: { id: number; client: { name: string }; user?: { name: string }; start_time: string; end_time: string; work_status: string }) => (
                    <li key={s.id} className={`${styles.card} p-5 flex flex-col justify-between h-full`}>
                      <div className="mb-4">
                        <div className="text-sm mb-1">
                          <span className={styles.clientName}>{s.client?.name}</span>
                        </div>
                        <div className="text-xs">
                          <span className={styles.userName}>{s.user?.name ?? '未割当'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 pb-1">
                        <span className={`${styles.timeText} text-sm font-mono`}>{s.start_time} - {s.end_time}</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${s.work_status === 'work' ? styles.statusBadgeWork : styles.statusBadgeNotWork} ${styles.statusBadge}`}>
                          {s.work_status === 'work' ? '出勤' : '未出勤'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
