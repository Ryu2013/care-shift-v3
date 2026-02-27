import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'

export default function WorkStatusesPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const { data, isLoading } = useQuery({
    queryKey: ['workStatuses', date],
    queryFn: () => apiClient.get('/work_statuses', { params: { date } }).then((r) => r.data),
  })

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">勤務状況</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
      {isLoading ? (
        <div>読み込み中...</div>
      ) : (
        <div>
          <div className="flex gap-4 mb-4 text-sm">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded">出勤: {data?.work_count}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded">未出勤: {data?.not_work_count}</span>
          </div>
          <ul className="space-y-2">
            {data?.shifts?.map((s: { id: number; client: { name: string }; user?: { name: string }; start_time: string; end_time: string; work_status: string }) => (
              <li key={s.id} className="bg-white p-3 rounded shadow text-sm flex justify-between">
                <span>{s.client?.name} / {s.user?.name ?? '未割当'}</span>
                <span>{s.start_time} - {s.end_time}</span>
                <span className={s.work_status === 'work' ? 'text-green-600' : 'text-gray-400'}>
                  {s.work_status === 'work' ? '出勤' : '未出勤'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
