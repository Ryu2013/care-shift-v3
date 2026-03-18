import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient, updateClient } from '../../../../api/clients'
import { getTeams } from '../../../../api/teams'
import { getUsers } from '../../../../api/users'
import { getClientNeeds, createClientNeed, deleteClientNeed } from '../../../../api/client_needs'
import { createUserClient, deleteUserClient } from '../../../../api/user_clients'
import type { Client, Team, ShiftType } from '../../../../types'
import styles from './ClientFormModal.module.css'

interface ClientFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void | Promise<unknown>
    initialTeamId?: number | ''
    client?: Client
}

export default function ClientFormModal({ isOpen, onClose, onSuccess, initialTeamId, client }: ClientFormModalProps) {
    const queryClient = useQueryClient()

    const [name, setName] = useState(client?.name ?? '')
    const [address, setAddress] = useState(client?.address ?? '')
    const [teamId, setTeamId] = useState<number | ''>(client?.team_id ?? initialTeamId ?? '')

    // Client Need setup states
    const [needWeek, setNeedWeek] = useState<string>('monday')
    const [needShiftType, setNeedShiftType] = useState<ShiftType>('day')
    const [needStartTime, setNeedStartTime] = useState('09:00')
    const [needEndTime, setNeedEndTime] = useState('18:00')
    const [needSlots, setNeedSlots] = useState<number>(1)

    // User Client setup states
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('')

    // Fetch teams for select dropdown
    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: () => getTeams().then((res: { data: Team[] }) => res.data),
        enabled: isOpen
    })

    // Fetch client needs if editing existing client
    const { data: clientNeeds } = useQuery({
        queryKey: ['clientNeeds', client?.id],
        queryFn: () => getClientNeeds(client!.id).then((res) => res.data),
        enabled: isOpen && !!client?.id
    })

    // Fetch users for the current team to assign to client
    const { data: teamUsers } = useQuery({
        queryKey: ['users', teamId],
        queryFn: () => getUsers(teamId as number).then((res) => res.data),
        enabled: isOpen && typeof teamId === 'number'
    })

    // Reset when client changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setName(client?.name ?? '')
            setAddress(client?.address ?? '')
            setTeamId(client?.team_id ?? initialTeamId ?? '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client?.id, isOpen, initialTeamId])

    const createMutation = useMutation({
        mutationFn: createClient,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['clients'] })
            await onSuccess()
            onClose()
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Client> }) => updateClient(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['clients'] })
            await onSuccess()
            onClose()
        }
    })

    const createNeedMutation = useMutation({
        mutationFn: createClientNeed,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientNeeds', client?.id] })
        },
        onError: (err: any) => {
            const msg = err.response?.data?.errors?.join('\n') || '登録に失敗しました'
            alert(msg)
        }
    })

    const deleteNeedMutation = useMutation({
        mutationFn: deleteClientNeed,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientNeeds', client?.id] })
        }
    })

    const createUserClientMutation = useMutation({
        mutationFn: createUserClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            setSelectedUserId('')
        },
        onError: (err: any) => {
            const msg = err.response?.data?.errors?.join('\n') || '割り当てに失敗しました'
            alert(msg)
        }
    })

    const deleteUserClientMutation = useMutation({
        mutationFn: deleteUserClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // teamId is required
        if (teamId === '') {
            alert('部署を選択してください')
            return
        }

        const payload: Partial<Client> = {
            name,
            address: address || null,
            team_id: teamId
        }

        if (client) {
            updateMutation.mutate({ id: client.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const handleAddNeed = () => {
        if (!client) return
        if (!needStartTime || !needEndTime) {
            alert('時間を指定してください')
            return
        }
        createNeedMutation.mutate({
            client_id: client.id,
            week: needWeek,
            shift_type: needShiftType,
            start_time: needStartTime,
            end_time: needEndTime,
            slots: needSlots
        })
    }

    const handleAddUserClient = () => {
        if (!client || !selectedUserId) return
        createUserClientMutation.mutate({
            client_id: client.id,
            user_id: selectedUserId as number
        })
    }

    if (!isOpen) return null

    const weekLabels: Record<string, string> = {
        sunday: '日', monday: '月', tuesday: '火', wednesday: '水', thursday: '木', friday: '金', saturday: '土'
    }
    const shiftTypeLabels = {
        day: '日勤', night: '夜勤', escort: '同行'
    }

    return (
        <div className={`${styles.backdrop} fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto`}>
            <div className={`${styles.modal} w-full max-w-2xl overflow-hidden animate-fade-in-up my-auto`}>
                <div className={`${styles.header} flex items-center justify-between p-6`}>
                    <h2 className={`${styles.title} text-xl`}>利用者を{client ? '編集' : '登録'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="clientTeamId" className={`${styles.label} block text-sm`}>部署（チーム） <span className={styles.required}>*</span></label>
                            <select
                                id="clientTeamId"
                                value={teamId}
                                onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : '')}
                                required
                                className={`${styles.field} w-full px-4 py-2`}
                            >
                                <option value="">部署を選択</option>
                                {teams?.map((t: Team) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="clientName" className={`${styles.label} block text-sm`}>お名前 <span className={styles.required}>*</span></label>
                            <input
                                id="clientName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="例：山田 太郎"
                                className={`${styles.field} w-full px-4 py-2`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="clientAddress" className={`${styles.label} block text-sm`}>住所</label>
                            <input
                                id="clientAddress"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="例：東京都渋谷区..."
                                className={`${styles.field} w-full px-4 py-2`}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className={`${styles.submitButton} w-full py-3`}
                            >
                                {createMutation.isPending || updateMutation.isPending ? '保存中...' : (client ? '更新する' : '登録する')}
                            </button>
                        </div>
                    </form>

                    {client && (
                        <div className={`${styles.section} mt-8 pt-6`}>
                            <h3 className={`${styles.sectionTitle} text-lg mb-4 flex items-center gap-2`}>
                                <svg className={`${styles.sectionIcon} w-5 h-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                週間基本シフト要件
                            </h3>

                            {/* Need List */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {clientNeeds?.length === 0 ? (
                                    <p className={`${styles.emptyBox} text-sm text-center py-4`}>基本シフト要件は登録されていません</p>
                                ) : (
                                    clientNeeds?.map((need) => {
                                        const formatTime = (t: string) => t.substring(11, 16)
                                        return (
                                            <div key={need.id} className={`${styles.listRow} flex items-center justify-between p-3`}>
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm px-2">
                                                    <span className={`${styles.weekdayBadge} w-10 text-center px-2 py-1`}>{weekLabels[need.week]}</span>
                                                    <span className={`${styles.timeBadge} font-mono px-2 py-1`}>{formatTime(need.start_time)} - {formatTime(need.end_time)}</span>
                                                    <span className={`${styles.typeBadge} text-xs px-2 py-1`}>{shiftTypeLabels[need.shift_type as keyof typeof shiftTypeLabels]}</span>
                                                    <span className={styles.slotsText}>{need.slots}枠</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('この要件を削除しますか？')) {
                                                            deleteNeedMutation.mutate(need.id)
                                                        }
                                                    }}
                                                    disabled={deleteNeedMutation.isPending}
                                                    className={`${styles.iconButton} p-2 flex-shrink-0`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Add Need Form */}
                            <div className={`${styles.subPanel} p-4`}>
                                <h4 className={`${styles.subPanelTitle} text-sm mb-3`}>要件の追加</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                                    <div className="space-y-1">
                                        <label className={`${styles.miniLabel} block text-xs`}>曜日</label>
                                        <select value={needWeek} onChange={e => setNeedWeek(e.target.value)} className={`${styles.miniField} w-full text-sm px-2 py-1.5`}>
                                            {Object.entries(weekLabels).map(([k, v]) => <option key={k} value={k}>{v}曜</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${styles.miniLabel} block text-xs`}>開始</label>
                                        <input type="time" value={needStartTime} onChange={e => setNeedStartTime(e.target.value)} className={`${styles.miniField} w-full text-sm px-2 py-1.5`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${styles.miniLabel} block text-xs`}>終了</label>
                                        <input type="time" value={needEndTime} onChange={e => setNeedEndTime(e.target.value)} className={`${styles.miniField} w-full text-sm px-2 py-1.5`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${styles.miniLabel} block text-xs`}>種別</label>
                                        <select value={needShiftType} onChange={e => setNeedShiftType(e.target.value as ShiftType)} className={`${styles.miniField} w-full text-sm px-2 py-1.5`}>
                                            {Object.entries(shiftTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${styles.miniLabel} block text-xs`}>枠数</label>
                                        <input type="number" min="1" max="10" value={needSlots} onChange={e => setNeedSlots(Number(e.target.value))} className={`${styles.miniField} w-full text-sm px-2 py-1.5 text-center`} />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleAddNeed}
                                            disabled={createNeedMutation.isPending}
                                            className={`${styles.smallActionButton} w-full py-1.5 px-2 text-sm`}
                                        >
                                            {createNeedMutation.isPending ? '...' : '+ 追加'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {client && (
                        <div className={`${styles.section} mt-8 pt-6`}>
                            <h3 className={`${styles.sectionTitle} text-lg mb-4 flex items-center gap-2`}>
                                <svg className={`${styles.sectionIcon} w-5 h-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                担当従業員
                            </h3>

                            {/* Assigned Users List */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {!client.user_clients || client.user_clients.length === 0 ? (
                                    <p className={`${styles.emptyBox} text-sm text-center py-4`}>担当従業員は割り当てられていません</p>
                                ) : (
                                    client.user_clients.map((uc) => (
                                        <div key={uc.id} className={`${styles.listRow} flex items-center justify-between p-3`}>
                                            <span className={`${styles.assignedUserName} px-2`}>{uc.user_name}</span>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`${uc.user_name}さんを担当から外しますか？`)) {
                                                        deleteUserClientMutation.mutate(uc.id)
                                                    }
                                                }}
                                                disabled={deleteUserClientMutation.isPending}
                                                className={`${styles.iconButton} p-2 flex-shrink-0`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add User Client Form */}
                            <div className={`${styles.subPanel} p-4`}>
                                <h4 className={`${styles.subPanelTitle} text-sm mb-3`}>担当者の追加</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={selectedUserId}
                                        onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                                        className={`${styles.miniField} flex-1 text-sm px-3 py-2 rounded-lg`}
                                    >
                                        <option value="">（未割り当ての従業員から選択）</option>
                                        {teamUsers
                                            ?.filter(u => !client.user_clients?.some(uc => uc.user_id === u.id))
                                            .map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddUserClient}
                                        disabled={!selectedUserId || createUserClientMutation.isPending}
                                        className={`${styles.assignButton} py-2 px-6 text-sm`}
                                    >
                                        {createUserClientMutation.isPending ? '...' : '追加'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
