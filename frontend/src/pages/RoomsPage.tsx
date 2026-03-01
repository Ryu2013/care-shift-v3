import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roomApi } from '../api/rooms'

export default function RoomsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing')
  const [newRoomName, setNewRoomName] = useState('')

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getRooms,
  })

  const createRoom = useMutation({
    mutationFn: (name: string) => roomApi.createRoom({ name }),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setNewRoomName('')
      navigate(`/rooms/${newRoom.id}`)
    },
  })

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    createRoom.mutate(newRoomName)
  }

  if (isLoading) return <div className="p-4 flex justify-center items-center h-full text-gray-500">読み込み中...</div>

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">チャットルーム</h1>

      {/* Toggle Switch */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner max-w-md mx-auto">
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'existing'
              ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          onClick={() => setActiveTab('existing')}
        >
          既存
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'new'
              ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          onClick={() => setActiveTab('new')}
        >
          新規
        </button>
      </div>

      {activeTab === 'existing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {rooms && rooms.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {rooms.map((r) => (
                <li
                  key={r.id}
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  className="px-6 py-4 hover:bg-green-50/50 cursor-pointer transition-colors group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shadow-sm">
                      {r.name.charAt(0) || '#'}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                      {r.name}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>ルームがありません。「新規」タブから作成してください。</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">新しいルームを作成</h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
                ルーム名
              </label>
              <input
                id="roomName"
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="例: フロント業務連絡"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-3 bg-gray-50/50"
                disabled={createRoom.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={!newRoomName.trim() || createRoom.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createRoom.isPending ? '作成中...' : 'ルームを作成する'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
