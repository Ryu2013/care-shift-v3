import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers } from '../../../../api/users'
import { getClients } from '../../../../api/clients'
import { createShift, updateShift, generateMonthlyShifts, deleteShift } from '../../../../api/shifts'
import type { ShiftType, User, Shift, Client } from '../../../../types'
import { useEffect } from 'react'
import styles from './ShiftFormModal.module.css'

interface ShiftFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    teamId?: number
    clientId?: number
    initialDate?: string
    shift?: Shift
}

export default function ShiftFormModal({ isOpen, onClose, onSuccess, teamId, clientId, initialDate, shift }: ShiftFormModalProps) {
    const queryClient = useQueryClient()
    const formatTimeForInput = (timeString: string) => {
        if (!timeString) return '09:00'
        if (timeString.includes('T')) {
            const match = timeString.match(/T(\d{2}:\d{2})/)
            return match ? match[1] : timeString.substring(0, 5)
        }
        return timeString.substring(0, 5)
    }

    const [userId, setUserId] = useState<number | ''>(shift?.user_id ?? '')
    const [shiftType, setShiftType] = useState<ShiftType>(shift?.shift_type ?? 'day')
    const [startTime, setStartTime] = useState(formatTimeForInput(shift?.start_time ?? '09:00'))
    const [endTime, setEndTime] = useState(formatTimeForInput(shift?.end_time ?? '18:00'))
    const [date, setDate] = useState(shift?.date ?? initialDate ?? new Date().toISOString().split('T')[0])
    const [note, setNote] = useState(shift?.note ?? '')

    // Reset when shift changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setUserId(shift?.user_id ?? '')
            setShiftType(shift?.shift_type ?? 'day')
            setStartTime(formatTimeForInput(shift?.start_time ?? '09:00'))
            setEndTime(formatTimeForInput(shift?.end_time ?? '18:00'))
            setDate(shift?.date ?? initialDate ?? new Date().toISOString().split('T')[0])
            setNote(shift?.note ?? '')
        }
    }, [shift, isOpen, initialDate])

    const { data: users } = useQuery({
        queryKey: ['users', teamId],
        queryFn: () => getUsers(teamId).then((res: { data: User[] }) => res.data),
        enabled: isOpen && !!teamId
    })

    const { data: clients } = useQuery({
        queryKey: ['clients', teamId],
        queryFn: () => getClients(teamId).then((res: { data: Client[] }) => res.data),
        enabled: isOpen && !!teamId
    })

    const clientIdToUse = shift ? shift.client_id : clientId
    const currentClient = clients?.find(c => c.id === clientIdToUse)
    const allowedUserIds = currentClient?.user_clients?.map(uc => uc.user_id) || []

    // If no client is selected or client has no specific user assignments, we might just show an empty list or let them pick anyone?
    // Let's strictly filter: only assigned users are shown.
    const filteredUsers = users?.filter(u => allowedUserIds.includes(u.id)) || []

    const createMutation = useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] })
            onSuccess()
            onClose()
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Shift> }) => updateShift(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] })
            onSuccess()
            onClose()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteShift,
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
        if (!clientIdToUse) return

        const payload = {
            user_id: userId === '' ? null : userId,
            client_id: clientIdToUse,
            shift_type: shiftType,
            start_time: startTime,
            end_time: endTime,
            date,
            note,
            work_status: shift ? shift.work_status : 'not_work' as const
        }

        if (shift) {
            updateMutation.mutate({ id: shift.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    if (!isOpen) return null

    return (
        <div className={`${styles.backdrop} fixed inset-0 z-50 flex items-center justify-center p-4`}>
            <div className={`${styles.modal} w-full max-w-md overflow-hidden animate-fade-in-up`}>
                <div className={`${styles.header} flex items-center justify-between p-6`}>
                    <h2 className={`${styles.title} text-xl`}>シフトを{shift ? '編集' : '登録'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {clientId && !shift && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    if (window.confirm('今月のシフトを自動生成します。よろしいですか？')) {
                                        generateMutation.mutate()
                                    }
                                }}
                                disabled={generateMutation.isPending}
                                className={`${styles.generateButton} w-full py-2 px-4`}
                            >
                                {generateMutation.isPending ? '生成中...' : '今月のシフト自動生成'}
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className={`${styles.label} block text-sm`}>担当従業員</label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
                                className={`${styles.field} w-full px-4 py-2`}
                            >
                                <option value="">担当従業員を選択</option>
                                {filteredUsers?.map((user: User) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            {currentClient && filteredUsers.length === 0 && (
                                <p className={`${styles.errorText} text-sm mt-1`}>
                                    ※ 顧客画面で担当従業員を割り当ててください
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className={`${styles.label} block text-sm`}>シフト種別</label>
                            <select
                                value={shiftType}
                                onChange={(e) => setShiftType(e.target.value as ShiftType)}
                                className={`${styles.field} w-full px-4 py-2`}
                            >
                                <option value="day">日勤</option>
                                <option value="night">夜勤</option>
                                <option value="escort">同行</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={`${styles.label} block text-sm`}>開始時間</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className={`${styles.field} w-full px-4 py-2`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={`${styles.label} block text-sm`}>終了時間</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className={`${styles.field} w-full px-4 py-2`}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={`${styles.label} block text-sm`}>日付</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={`${styles.field} w-full px-4 py-2`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`${styles.label} block text-sm`}>備考</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className={`${styles.field} w-full px-4 py-2`}
                            />
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                                className={`${styles.submitButton} w-full py-3`}
                            >
                                {createMutation.isPending || updateMutation.isPending ? '保存中...' : (shift ? '更新する' : '登録する')}
                            </button>
                            {shift && (
                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => {
                                        if (window.confirm('このシフトを本当に削除しますか？')) {
                                            deleteMutation.mutate(shift.id)
                                        }
                                    }}
                                    className={`${styles.deleteButton} w-full py-2`}
                                >
                                    {deleteMutation.isPending ? '削除中...' : '削除する'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
