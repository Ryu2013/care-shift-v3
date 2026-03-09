import { createPortalSession } from '../api/subscription'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getOffice, updateOffice } from '../api/office'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../api/teams'
import type { Office, Team } from '../types'
import { Header } from '../components/Header'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState<'departments' | 'company'>('departments')

    // Office State
    const [office, setOffice] = useState<Office | null>(null)
    const [officeName, setOfficeName] = useState('')
    const [isUpdatingOffice, setIsUpdatingOffice] = useState(false)
    const [officeMessage, setOfficeMessage] = useState({ type: '', text: '' })
    const [isRedirectingPortal, setIsRedirectingPortal] = useState(false)
    const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)

    // Check for success=true in URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        if (queryParams.get('success') === 'true') {
            setSubscriptionSuccess(true)
            setActiveTab('company') // Switch to company tab to show the message
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Auto hide after 5 seconds
            setTimeout(() => setSubscriptionSuccess(false), 5000)
        }
    }, [location])

    // ... SNIP ...

    const handlePortalRedirect = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsRedirectingPortal(true)
        try {
            const response = await createPortalSession()
            if (response.data && response.data.url) {
                window.location.href = response.data.url
            } else {
                alert('ポータルへのリダイレクトURLが取得できませんでした。')
                setIsRedirectingPortal(false)
            }
        } catch {
            alert('顧客ポータルへの接続に失敗しました。')
            setIsRedirectingPortal(false)
        }
    }

    // Teams State
    const [teams, setTeams] = useState<Team[]>([])
    const [newTeamName, setNewTeamName] = useState('')
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null)
    const [editingTeamName, setEditingTeamName] = useState('')

    useEffect(() => {
        fetchOffice()
        fetchTeams()
    }, [])

    const fetchOffice = async () => {
        try {
            const response = await getOffice()
            setOffice(response.data)
            setOfficeName(response.data.name)
        } catch (error) {
            console.error('Failed to fetch office', error)
        }
    }

    const fetchTeams = async () => {
        try {
            const response = await getTeams()
            setTeams(response.data)
        } catch (error) {
            console.error('Failed to fetch teams', error)
        }
    }

    const handleUpdateOffice = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdatingOffice(true)
        setOfficeMessage({ type: '', text: '' })
        try {
            const response = await updateOffice(officeName)
            setOffice(response.data)
            setOfficeMessage({ type: 'success', text: '会社情報を更新しました。' })
        } catch (error) {
            setOfficeMessage({ type: 'error', text: '会社情報の更新に失敗しました。' })
        } finally {
            setIsUpdatingOffice(false)
        }
    }

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTeamName.trim()) return
        try {
            const response = await createTeam(newTeamName)
            setTeams([...teams, response.data])
            setNewTeamName('')
        } catch (error) {
            console.error('Failed to create team', error)
            alert('部署の作成に失敗しました。')
        }
    }

    const handleUpdateTeam = async (id: number) => {
        if (!editingTeamName.trim()) return
        try {
            const response = await updateTeam(id, editingTeamName)
            setTeams(teams.map(t => (t.id === id ? response.data : t)))
            setEditingTeamId(null)
        } catch (error) {
            console.error('Failed to update team', error)
            alert('部署名の更新に失敗しました。')
        }
    }

    const handleDeleteTeam = async (id: number) => {
        if (!window.confirm('本当にこの部署を削除しますか？')) return
        try {
            await deleteTeam(id)
            setTeams(teams.filter(t => t.id !== id))
        } catch (error) {
            console.error('Failed to delete team', error)
            alert('部署を消去するには従業員、顧客がいない必要があります。')
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }

    return (
        <div className="min-h-screen">
            <Header />
            <div className="pt-28 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
                <div className={`${styles.container} p-6 sm:p-10`}>

                    <div className={`${styles.tabContainer} flex p-1 mb-8`}>
                        <button
                            className={`flex-1 py-3 px-4 text-sm sm:text-base ${styles.tabButton} ${activeTab === 'departments' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                            onClick={() => setActiveTab('departments')}
                        >
                            部署管理
                        </button>
                        <button
                            className={`flex-1 py-3 px-4 text-sm sm:text-base ${styles.tabButton} ${activeTab === 'company' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                            onClick={() => setActiveTab('company')}
                        >
                            会社情報
                        </button>
                    </div>

                    {activeTab === 'departments' && (
                        <div className="space-y-6">
                            <div className={`${styles.infoAlert} p-4 text-sm`}>
                                部署を削除するには、その部署に所属する従業員や顧客がいない状態にする必要があります。
                            </div>

                            <div className={`${styles.card} p-6`}>
                                <h3 className={`${styles.sectionTitle} text-lg mb-4 pb-3`}>新しい部署の追加</h3>
                                <form onSubmit={handleCreateTeam} className="flex gap-3">
                                    <input
                                        type="text"
                                        className={`${styles.input} flex-1 py-2 px-4 w-full`}
                                        placeholder="部署名を入力"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                    />
                                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary} px-6 py-2`} disabled={!newTeamName.trim()}>
                                        追加
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {teams.length === 0 ? (
                                    <div className={`${styles.card} p-8 text-center`}>
                                        <div className="text-gray-500">部署が登録されていません。</div>
                                    </div>
                                ) : (
                                    teams.map(team => (
                                        <div key={team.id} className={`${styles.itemRow} flex items-center justify-between p-4`}>
                                            {editingTeamId === team.id ? (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <input
                                                        type="text"
                                                        className={`${styles.input} flex-1 py-2 px-3`}
                                                        value={editingTeamName}
                                                        onChange={(e) => setEditingTeamName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdateTeam(team.id)} className={`${styles.btn} ${styles.btnPrimary} px-4 py-2 text-sm`}>保存</button>
                                                    <button onClick={() => setEditingTeamId(null)} className={`${styles.btn} ${styles.btnSecondary} px-4 py-2 text-sm`}>取消</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex-1">
                                                        <div className={`${styles.itemRowTitle}`}>{team.name}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTeamId(team.id)
                                                                setEditingTeamName(team.name)
                                                            }}
                                                            className={`${styles.btn} ${styles.btnSecondary} px-4 py-2 text-sm`}
                                                        >
                                                            編集
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeam(team.id)}
                                                            className={`${styles.btnDanger} px-3 py-2 text-sm`}
                                                            disabled={teams.length <= 1}
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'company' && office && (
                        <div className="space-y-8">
                            <div className={`${styles.card} p-6`}>
                                <h3 className={`${styles.sectionTitle} text-lg mb-4 pb-3`}>契約状況</h3>

                                {subscriptionSuccess && (
                                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 shadow-sm animate-fade-in">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-green-800 text-sm">サブスクリプションに加入しました！</p>
                                            <p className="text-green-700 text-xs mt-1">すべてのご機能をご利用いただけます。</p>
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    const status = office.subscription_status
                                    const isActive = ['active', 'trialing', 'past_due', 'unpaid'].includes(status || '')

                                    if (isActive) {
                                        if (office.cancel_at_period_end) {
                                            return (
                                                <div className="space-y-4 shadow-sm border border-yellow-100 bg-yellow-50/50 p-5 rounded-2xl">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`inline-block px-3 py-1 text-sm ${styles.statusBadge} ${styles.statusWarning}`}>解約予約済み</div>
                                                        <span className="text-yellow-700 font-bold">サブスクリプションを解約しました</span>
                                                    </div>
                                                    <p className="text-gray-700 font-medium text-sm leading-relaxed">
                                                        <strong>{formatDate(office.current_period_end)}</strong> までは引き継ぎ期間として現在のプランをお使いいただけます。期限を過ぎると自動的に無料プランへ移行します。
                                                    </p>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className="space-y-4 shadow-sm border border-green-100 bg-green-50/50 p-5 rounded-2xl">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`inline-block px-3 py-1 text-sm ${styles.statusBadge} ${styles.statusSuccess}`}>契約中</div>
                                                        <span className="text-green-700 font-bold">サブスクリプションに加入しています 🎉</span>
                                                    </div>
                                                    <p className="text-gray-700 font-medium text-sm leading-relaxed">
                                                        次回更新予定日: <strong>{formatDate(office.current_period_end)}</strong><br />
                                                        引き続きすべての機能をご利用いただけます。
                                                    </p>
                                                </div>
                                            )
                                        }
                                    } else if (status === 'canceled') {
                                        return (
                                            <div className="space-y-4">
                                                <div className={`inline-block px-3 py-1 text-sm ${styles.statusBadge} ${styles.statusWarning}`}>解約済み</div>
                                                <p className="text-gray-600 text-sm leading-relaxed mt-3">
                                                    現在は無料プランをご利用中です。
                                                </p>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div className="py-2">
                                                <p className="text-gray-500 text-sm">現在は無料プランをご利用中です。</p>
                                            </div>
                                        )
                                    }
                                })()}

                                <div className="mt-8 pt-6 border-t border-white/20">
                                    {(() => {
                                        const status = office.subscription_status
                                        const isActive = ['active', 'trialing', 'past_due', 'unpaid'].includes(status || '')

                                        if (isActive || status === 'canceled') {
                                            return (
                                                <button
                                                    onClick={handlePortalRedirect}
                                                    disabled={isRedirectingPortal}
                                                    className={`block w-full text-center px-6 py-3 ${styles.btn} ${isRedirectingPortal ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border border-gray-300' : styles.btnSecondary}`}
                                                >
                                                    {isRedirectingPortal ? 'リダイレクト中...' : '契約内容の確認・変更・解約'}
                                                </button>
                                            )
                                        } else {
                                            return (
                                                <button
                                                    onClick={() => navigate('/subscription')}
                                                    className={`block w-full text-center px-6 py-3 ${styles.btn} ${styles.btnPrimary}`}
                                                >
                                                    プランを選択する
                                                </button>
                                            )
                                        }
                                    })()}
                                </div>
                            </div>

                            <div className={`${styles.card} p-6`}>
                                <h3 className={`${styles.sectionTitle} text-lg mb-4 pb-3`}>会社情報の編集</h3>
                                {officeMessage.text && (
                                    <div className={`${styles.infoAlert} p-4 mb-6 text-sm ${officeMessage.type === 'success' ? '' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {officeMessage.text}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateOffice} className="space-y-6">
                                    <div>
                                        <label className={`${styles.label} block text-xs uppercase tracking-widest pl-1 mb-2`}>会社名 / 事業所名</label>
                                        <input
                                            type="text"
                                            className={`${styles.input} w-full py-3 px-4`}
                                            value={officeName}
                                            onChange={(e) => setOfficeName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className={`w-full py-3 px-6 ${styles.btn} ${styles.btnPrimary}`} disabled={isUpdatingOffice}>
                                        {isUpdatingOffice ? '保存中...' : '情報を更新する'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
