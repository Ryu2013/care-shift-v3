import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import type { Room } from '../types'

export default function RoomsPage() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiClient.get<Room[]>('/rooms').then((r) => r.data),
  })

  if (isLoading) return <div>読み込み中...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">チャット</h1>
      <ul className="space-y-2">
        {rooms?.map((r) => (
          <li key={r.id} className="bg-white p-3 rounded shadow text-sm cursor-pointer hover:bg-gray-50">
            {r.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
