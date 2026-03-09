import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient, updateClient } from '../api/clients'
import { getTeams } from '../api/teams'
import { getClientNeeds, createClientNeed, deleteClientNeed } from '../api/client_needs'
import type { Client, Team, ClientNeed, ShiftType } from '../types'

interface ClientFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
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

    // Reset when client changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setName(client?.name ?? '')
            setAddress(client?.address ?? '')
            setTeamId(client?.team_id ?? initialTeamId ?? '')
        }
    }, [client, isOpen, initialTeamId])

    const createMutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            onSuccess()
            onClose()
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Client> }) => updateClient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            onSuccess()
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

    if (!isOpen) return null

    const weekLabels: Record<string, string> = {
        sunday: '日', monday: '月', tuesday: '火', wednesday: '水', thursday: '木', friday: '金', saturday: '土'
    }
    const shiftTypeLabels = {
        day: '日勤', night: '夜勤', escort: '同行'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up my-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">利用者を{client ? '編集' : '登録'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">部署（チーム） <span className="text-red-500">*</span></label>
                            <select
                                value={teamId}
                                onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : '')}
                                required
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all bg-white"
                            >
                                <option value="">部署を選択</option>
                                {teams?.map((t: Team) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">お名前 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="例：山田 太郎"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">住所</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="例：東京都渋谷区..."
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="w-full py-3 bg-[#5daaf5] hover:bg-[#4a90e2] text-white font-bold rounded-full shadow-lg transition-all active:transform active:scale-95 disabled:opacity-50"
                            >
                                {createMutation.isPending || updateMutation.isPending ? '保存中...' : (client ? '更新する' : '登録する')}
                            </button>
                        </div>
                    </form>

                    {client && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                週間基本シフト要件
                            </h3>

                            {/* Need List */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {clientNeeds?.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">基本シフト要件は登録されていません</p>
                                ) : (
                                    clientNeeds?.map((need) => {
                                        const formatTime = (t: string) => t.substring(11, 16)
                                        return (
                                            <div key={need.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm px-2">
                                                    <span className="font-bold text-gray-700 w-10 text-center bg-white px-2 py-1 rounded shadow-sm">{weekLabels[need.week]}</span>
                                                    <span className="text-gray-600 font-mono bg-white px-2 py-1 rounded shadow-sm">{formatTime(need.start_time)} - {formatTime(need.end_time)}</span>
                                                    <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100">{shiftTypeLabels[need.shift_type as keyof typeof shiftTypeLabels]}</span>
                                                    <span className="font-bold text-gray-700">{need.slots}枠</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('この要件を削除しますか？')) {
                                                            deleteNeedMutation.mutate(need.id)
                                                        }
                                                    }}
                                                    disabled={deleteNeedMutation.isPending}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
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
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">要件の追加</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600">曜日</label>
                                        <select value={needWeek} onChange={e => setNeedWeek(e.target.value)} className="w-full text-sm px-2 py-1.5 rounded border border-gray-300">
                                            {Object.entries(weekLabels).map(([k, v]) => <option key={k} value={k}>{v}曜</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600">開始</label>
                                        <input type="time" value={needStartTime} onChange={e => setNeedStartTime(e.target.value)} className="w-full text-sm px-2 py-1.5 rounded border border-gray-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600">終了</label>
                                        <input type="time" value={needEndTime} onChange={e => setNeedEndTime(e.target.value)} className="w-full text-sm px-2 py-1.5 rounded border border-gray-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600">種別</label>
                                        <select value={needShiftType} onChange={e => setNeedShiftType(e.target.value as ShiftType)} className="w-full text-sm px-2 py-1.5 rounded border border-gray-300">
                                            {Object.entries(shiftTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600">枠数</label>
                                        <input type="number" min="1" max="10" value={needSlots} onChange={e => setNeedSlots(Number(e.target.value))} className="w-full text-sm px-2 py-1.5 rounded border border-gray-300 text-center" />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleAddNeed}
                                            disabled={createNeedMutation.isPending}
                                            className="w-full py-1.5 px-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded shadow-sm text-sm transition-colors border border-blue-200 disabled:opacity-50"
                                        >
                                            {createNeedMutation.isPending ? '...' : '+ 追加'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
