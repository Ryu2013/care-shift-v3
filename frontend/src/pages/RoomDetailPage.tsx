import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomApi } from '../api/rooms'
import { messageApi } from '../api/messages'
import { entryApi } from '../api/entries'
import { getUsers } from '../api/users'
import { cable } from '../api/cable'
import { useCurrentUser } from '../hooks/useCurrentUser'
import '../App.css'

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
        queryFn: () => roomApi.getRoom(roomId),
    })

    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['messages', roomId],
        queryFn: () => messageApi.getMessages(roomId),
    })

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers().then((res) => res.data),
    })

    const createMessage = useMutation({
        mutationFn: (newContent: string) => messageApi.createMessage(roomId, newContent),
        onSuccess: () => {
            setContent('')
        }, // WebSocket will handle the list update
    })

    // Mutations for Entry Management
    const addEntry = useMutation({
        mutationFn: (userId: number) => entryApi.createEntry(roomId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms', roomId] })
        },
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // WebSocket Subscription
    useEffect(() => {
        const channel = cable.subscriptions.create(
            { channel: 'RoomChannel', room_id: roomId },
            {
                received(message: any) {
                    queryClient.setQueryData(['messages', roomId], (oldConfig: any) => {
                        if (!oldConfig) return [message]
                        // check if message is already in list to avoid duplicate rendering from own API request
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

    if (isLoadingRoom || isLoadingMessages) return <div className="p-4">読み込み中...</div>
    if (!room) return <div className="p-4">ルームが見つかりません</div>

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        createMessage.mutate(content)
    }

    const getUser = (userId: number) => users?.find((u) => u.id === userId)

    // Identify users in and out of the room
    const memberIds = room.users?.map((u) => u.id) || []
    const availableUsers = users?.filter((u) => !memberIds.includes(u.id)) || []
    const members = room.users || []

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-h-[800px] bg-gray-50 -mx-4 -my-6 sm:mx-0 sm:my-0 sm:border sm:rounded-lg overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-4 py-3 border-b shadow-sm z-10 relative">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/rooms')}
                        className="text-gray-500 hover:text-gray-700 mr-4 flex-shrink-0"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className="font-bold text-gray-800 truncate">{room.name}</h3>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 flex flex-col">
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
                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                            >
                                {!isMine && (
                                    <span className="text-xs text-gray-500 mb-1 ml-1">
                                        {msgUser?.name || '不明なユーザー'}
                                    </span>
                                )}
                                <div className={`flex items-end max-w-[80%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* User Icon placeholder if not mine */}
                                    {!isMine && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-2 flex-shrink-0 shadow-sm">
                                            {(msgUser?.name || '?').charAt(0)}
                                        </div>
                                    )}
                                    <div
                                        className={`px-4 py-2 rounded-2xl shadow-sm ${isMine
                                            ? 'bg-[#8de055] text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none'
                                            }`}
                                        style={{ wordBreak: 'break-word' }}
                                    >
                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                    </div>
                                    <div className={`text-[10px] text-gray-400 mb-1 ${isMine ? 'mr-2' : 'ml-2'}`}>
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
                    <div className="w-64 bg-white border-l shadow-xl flex flex-col z-20 absolute right-0 top-14 bottom-0 sm:relative sm:top-0 sm:bottom-auto">
                        <div className="p-4 border-b">
                            <h4 className="font-medium text-gray-800 flex justify-between items-center">
                                参加メンバー
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{members.length}</span>
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <ul className="space-y-1 mb-4">
                                {members.map(u => (
                                    <li key={`member-${u.id}`} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center justify-between">
                                        <span>{u.name}</span>
                                    </li>
                                ))}
                            </ul>

                            {availableUsers.length > 0 && (
                                <>
                                    <div className="px-4 py-2 bg-gray-50 border-y -mx-2 mb-2">
                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">未参加</h5>
                                    </div>
                                    <ul className="space-y-1">
                                        {availableUsers.map(u => (
                                            <li key={`invite-${u.id}`} className="px-3 py-2 text-sm text-gray-700 flex justify-between items-center bg-white rounded border border-transparent hover:border-gray-200">
                                                <span>{u.name}</span>
                                                <button
                                                    onClick={() => addEntry.mutate(u.id)}
                                                    disabled={addEntry.isPending}
                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
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
            <div className="bg-white px-4 py-3 border-t z-10 relative">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 border shadow-inner"
                        placeholder="メッセージを入力..."
                        disabled={createMessage.isPending}
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || createMessage.isPending}
                        className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors"
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
