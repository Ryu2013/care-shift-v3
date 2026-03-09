import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getRooms, createRoom } from '../api/rooms'
import { Header } from '../components/Header'
import styles from './RoomsPage.module.css'

export default function RoomsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing')
  const [newRoomName, setNewRoomName] = useState('')

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms().then(res => res.data),
  })

  const createRoomMutation = useMutation({
    mutationFn: (name: string) => createRoom({ name }).then(res => res.data),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setNewRoomName('')
      navigate(`/rooms/${newRoom.id}`)
    },
  })

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    createRoomMutation.mutate(newRoomName)
  }

  if (isLoading) return <div className="p-4 flex justify-center items-center h-full text-gray-500">読み込み中...</div>

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Toggle Switch */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'existing' ? styles.tabButtonActive : styles.tabButtonInactive}`}
            onClick={() => setActiveTab('existing')}
          >
            既存
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'new' ? styles.tabButtonActive : styles.tabButtonInactive}`}
            onClick={() => setActiveTab('new')}
          >
            新規
          </button>
        </div>

        {activeTab === 'existing' && (
          <div className={styles.card}>
            {rooms && rooms.length > 0 ? (
              <ul className={styles.roomList}>
                {rooms.map((r) => (
                  <li
                    key={r.id}
                    onClick={() => navigate(`/rooms/${r.id}`)}
                    className={styles.roomItem}
                  >
                    <div className={styles.roomInfo}>
                      <div className={styles.roomIcon}>
                        {r.name.charAt(0) || '#'}
                      </div>
                      <div className={styles.roomInfoContent}>
                        <div className={styles.roomNameContainer}>
                          <span className={styles.roomName}>
                            {r.name}
                          </span>
                          {r.has_unread && (
                            <span className={styles.unreadBadge}>New</span>
                          )}
                        </div>
                        {r.latest_message && (
                          <div className={styles.latestMessage}>
                            {r.latest_message.user?.name ? `${r.latest_message.user.name}: ` : ''}
                            {r.latest_message.content}
                          </div>
                        )}
                      </div>
                    </div>
                    <svg className={styles.chevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <p>ルームがありません。<br />「新規」タブから作成してください。</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <div className={styles.card}>
            <div className="p-6">
              <form onSubmit={handleCreateRoom}>
                <div className={styles.formGroup}>
                  <label htmlFor="roomName" className={styles.label}>ルーム名</label>
                  <input
                    id="roomName"
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className={styles.input}
                    placeholder="例: 介護スタッフ連絡板"
                    disabled={createRoomMutation.isPending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || createRoomMutation.isPending}
                  className={styles.submitButton}
                >
                  {createRoomMutation.isPending ? '作成中...' : 'ルームを作成'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
