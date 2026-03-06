import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoom } from '../api/rooms'
import { getMessages, createMessage } from '../api/messages'
import { entryApi } from '../api/entries'
import { getUsers } from '../api/users'
import { cable } from '../api/cable'
import { useCurrentUser } from '../hooks/useCurrentUser'
import styles from './RoomDetailPage.module.css'

export default function RoomDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const roomId = Number(id)
    const queryClient = useQueryClient()
    const { data: currentUser } = useCurrentUser()
    const [content, setContent] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: room, isLoading: isLoadingRoom } = useQuery({
        queryKey: ['rooms', roomId],
        queryFn: () => getRoom(roomId).then(res => res.data),
    })

    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['messages', roomId],
        queryFn: () => getMessages(roomId).then(res => res.data),
    })

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers().then((res) => res.data),
    })

    const createMessageMutation = useMutation({
        mutationFn: (newContent: string) => createMessage(roomId, newContent).then(res => res.data),
        onSuccess: () => {
            setContent('')
        },
    })

    const addEntry = useMutation({
        mutationFn: (userId: number) => entryApi.createEntry(roomId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms', roomId] })
        },
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const channel = cable.subscriptions.create(
            { channel: 'RoomChannel', room_id: roomId },
            {
                received(message: any) {
                    queryClient.setQueryData(['messages', roomId], (oldConfig: any) => {
                        if (!oldConfig) return [message]
                        if (oldConfig.some((m: any) => m.id === message.id)) return oldConfig;
                        return [...oldConfig, message]
                    })
                },
            }
        )
        return () => {
            channel.unsubscribe()
        }
    }, [roomId, queryClient])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (isLoadingRoom || isLoadingMessages) return <div className="p-4 flex justify-center items-center h-full text-gray-500">読み込み中...</div>
    if (!room) return <div className="p-4 text-center">ルームが見つかりません</div>

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        createMessageMutation.mutate(content)
    }

    const getUser = (userId: number) => users?.find((u) => u.id === userId)

    const memberIds = room.users?.map((u) => u.id) || []
    const availableUsers = users?.filter((u) => !memberIds.includes(u.id)) || []
    const members = room.users || []

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/rooms')}
                        className={styles.backButton}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className={styles.headerTitle}>{room.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/shifts')}
                        className={styles.sidebarToggle}
                        title="シフト表へ"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={styles.sidebarToggle}
                        title="メンバー管理"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.mainArea}>
                {/* Messages area */}
                <div className={styles.messagesArea}>
                    {messages?.map((msg) => {
                        const isMine = msg.user_id === currentUser?.id
                        const msgUser = getUser(msg.user_id)
                        const time = new Date(msg.created_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })

                        return (
                            <div
                                key={msg.id}
                                className={`${styles.messageRow} ${isMine ? styles.messageRowMine : styles.messageRowOther}`}
                            >
                                {!isMine && (
                                    <span className={styles.userName}>
                                        {msgUser?.name || '不明なユーザー'}
                                    </span>
                                )}
                                <div className={`${styles.bubbleContainer} ${isMine ? styles.bubbleContainerMine : styles.bubbleContainerOther}`}>
                                    {!isMine && (
                                        <div className={styles.userAvatar}>
                                            {(msgUser?.name || '?').charAt(0)}
                                        </div>
                                    )}
                                    <div className={`${styles.messageBubble} ${isMine ? styles.messageBubbleMine : styles.messageBubbleOther}`}>
                                        {msg.content}
                                    </div>
                                    <div className={`${styles.timestamp} ${isMine ? styles.timestampMine : styles.timestampOther}`}>
                                        {time}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Members Sidebar */}
                {isSidebarOpen && (
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <h4 className={styles.sidebarTitle}>
                                参加メンバー
                                <span className={styles.memberCount}>{members.length}</span>
                            </h4>
                        </div>
                        <div className={styles.sidebarContent}>
                            <ul className={styles.memberList}>
                                {members.map(u => (
                                    <li key={`member-${u.id}`} className={styles.memberItem}>
                                        {u.name}
                                    </li>
                                ))}
                            </ul>

                            {availableUsers.length > 0 && (
                                <>
                                    <div className={styles.sectionDivider}>
                                        <h5 className={styles.sectionTitle}>未参加</h5>
                                    </div>
                                    <ul className={styles.memberList}>
                                        {availableUsers.map(u => (
                                            <li key={`invite-${u.id}`} className={`${styles.memberItem} flex justify-between items-center`}>
                                                <span>{u.name}</span>
                                                <button
                                                    onClick={() => addEntry.mutate(u.id)}
                                                    disabled={addEntry.isPending}
                                                    className={styles.addButton}
                                                >
                                                    追加
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className={styles.inputArea}>
                <form onSubmit={handleSend} className={styles.inputForm}>
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.messageInput}
                        placeholder="メッセージを入力..."
                        disabled={createMessageMutation.isPending}
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || createMessageMutation.isPending}
                        className={styles.sendButton}
                    >
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}
