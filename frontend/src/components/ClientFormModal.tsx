import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient, updateClient } from '../api/clients'
import { getTeams } from '../api/teams'
import type { Client, Team } from '../types'

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

    // Fetch teams for select dropdown
    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: () => getTeams().then((res: { data: Team[] }) => res.data),
        enabled: isOpen
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
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
                </div>
            </div>
        </div>
    )
}
