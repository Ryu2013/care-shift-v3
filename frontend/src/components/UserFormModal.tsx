import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../api/users'
import { getTeams } from '../api/teams'
import type { User, Team, Role } from '../types'

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void | Promise<unknown>
    user?: User
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
    const queryClient = useQueryClient()

    // We strictly need a user to edit in this modal based on the feature request
    // But it's good practice to provide fallbacks for safety
    const [name, setName] = useState(user?.name ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [address, setAddress] = useState(user?.address ?? '')
    const [teamId, setTeamId] = useState<number | ''>(user?.team_id ?? '')
    const [role, setRole] = useState<Role>(user?.role ?? 'employee')

    // Fetch teams for select dropdown
    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: () => getTeams().then((res: { data: Team[] }) => res.data),
        enabled: isOpen
    })

    // Reset fields when user prop changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setName(user.name)
            setEmail(user.email)
            setAddress(user.address || '')
            setTeamId(user.team_id)
            setRole(user.role)
        }
    }, [user, isOpen])

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<User> }) => updateUser(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] })
            await onSuccess()
            onClose()
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) return

        if (teamId === '') {
            alert('部署を選択してください')
            return
        }

        const payload: Partial<User> = {
            name,
            email,
            address: address || null,
            team_id: teamId,
            role
        }

        updateMutation.mutate({ id: user.id, data: payload })
    }

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">スタッフ情報を編集</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="userName" className="block text-sm font-bold text-gray-700">お名前 <span className="text-red-500">*</span></label>
                            <input
                                id="userName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="例：山田 太郎"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="userEmail" className="block text-sm font-bold text-gray-700">メールアドレス <span className="text-red-500">*</span></label>
                            <input
                                id="userEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="例：example@mail.com"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="userAddress" className="block text-sm font-bold text-gray-700">住所</label>
                            <input
                                id="userAddress"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="例：東京都渋谷区..."
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="userTeamId" className="block text-sm font-bold text-gray-700">部署（チーム） <span className="text-red-500">*</span></label>
                            <select
                                id="userTeamId"
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
                            <label htmlFor="userRole" className="block text-sm font-bold text-gray-700">権限 <span className="text-red-500">*</span></label>
                            <select
                                id="userRole"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                                required
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all bg-white"
                            >
                                <option value="employee">スタッフ</option>
                                <option value="admin">管理者</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="w-full py-3 bg-[#5daaf5] hover:bg-[#4a90e2] text-white font-bold rounded-full shadow-lg transition-all active:transform active:scale-95 disabled:opacity-50"
                            >
                                {updateMutation.isPending ? '保存中...' : '更新する'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
