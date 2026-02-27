import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers } from '../api/users'
import { createShift, generateMonthlyShifts } from '../api/shifts'
import type { ShiftType, User } from '../types'

interface ShiftFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    teamId?: number
    clientId?: number
    initialDate?: string
}

export default function ShiftFormModal({ isOpen, onClose, onSuccess, teamId, clientId, initialDate }: ShiftFormModalProps) {
    const queryClient = useQueryClient()
    const [userId, setUserId] = useState<number | ''>('')
    const [shiftType, setShiftType] = useState<ShiftType>('day')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('18:00')
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
    const [note, setNote] = useState('')

    const { data: users } = useQuery({
        queryKey: ['users', teamId],
        queryFn: () => getUsers(teamId).then((res: { data: User[] }) => res.data),
        enabled: isOpen && !!teamId
    })

    const createMutation = useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] })
            onSuccess()
            onClose()
        }
    })

    const generateMutation = useMutation({
        mutationFn: () => generateMonthlyShifts(clientId!, date),
        onSuccess: (res: { data: { created: number } }) => {
            alert(`${res.data.created}件のシフトを生成しました`)
            queryClient.invalidateQueries({ queryKey: ['shifts'] })
            onSuccess()
            onClose()
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!clientId) return

        createMutation.mutate({
            user_id: userId === '' ? null : userId,
            client_id: clientId,
            shift_type: shiftType,
            start_time: startTime,
            end_time: endTime,
            date,
            note,
            work_status: 'work'
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">新規シフト登録</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {clientId && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    if (window.confirm('今月のシフトを自動生成します。よろしいですか？')) {
                                        generateMutation.mutate()
                                    }
                                }}
                                disabled={generateMutation.isPending}
                                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {generateMutation.isPending ? '生成中...' : '今月のシフト自動生成'}
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">担当従業員</label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            >
                                <option value="">担当従業員を選択</option>
                                {users?.map((user: User) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">シフト種別</label>
                            <select
                                value={shiftType}
                                onChange={(e) => setShiftType(e.target.value as ShiftType)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            >
                                <option value="day">日勤</option>
                                <option value="night">夜勤</option>
                                <option value="escort">同行</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">開始時間</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700">終了時間</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">日付</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">備考</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-3 bg-[#5daaf5] hover:bg-[#4a90e2] text-white font-bold rounded-full shadow-lg transition-all active:transform active:scale-95 disabled:opacity-50"
                            >
                                {createMutation.isPending ? '登録中...' : '登録する'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
