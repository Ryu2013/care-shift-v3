import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOffice, updateOffice } from '../api/office'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../api/teams'
import type { Office, Team } from '../types'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'departments' | 'company'>('departments')

    // Office State
    const [office, setOffice] = useState<Office | null>(null)
    const [officeName, setOfficeName] = useState('')
    const [isUpdatingOffice, setIsUpdatingOffice] = useState(false)
    const [officeMessage, setOfficeMessage] = useState({ type: '', text: '' })

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
        <div className={styles.settingsContainer}>
            <div className={`${styles.settingsHeader} flex items-center gap-4`}>
                <button onClick={() => navigate('/shifts')} className="hover:opacity-80 transition-opacity">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className={`${styles.settingsTitle} mb-0`}>設定</h1>
            </div>

            <div className="toggle-switch">
                <button
                    className={`toggle-btn ${activeTab === 'departments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('departments')}
                >
                    部署
                </button>
                <button
                    className={`toggle-btn ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    会社
                </button>
            </div>

            {activeTab === 'departments' && (
                <div>
                    <div className="alert alert-info">
                        <p>部署を消去するには従業員、顧客がいない必要があります。</p>
                    </div>

                    <div className={styles.settingsCard}>
                        <h3>新しい部署の追加</h3>
                        <form onSubmit={handleCreateTeam} className={styles.inputGroup}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="部署名"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!newTeamName.trim()}>
                                追加
                            </button>
                        </form>
                    </div>

                    <div className="list-group">
                        {teams.length === 0 ? (
                            <div className={styles.emptyState}>部署が登録されていません。</div>
                        ) : (
                            teams.map(team => (
                                <div key={team.id} className="list-item">
                                    {editingTeamId === team.id ? (
                                        <div className={`${styles.inputGroup} w-full`}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editingTeamName}
                                                onChange={(e) => setEditingTeamName(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateTeam(team.id)} className="btn btn-primary">保存</button>
                                            <button onClick={() => setEditingTeamId(null)} className="btn btn-secondary">キャンセル</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="list-item-title">{team.name}</div>
                                            <div className="list-item-actions">
                                                <button
                                                    onClick={() => {
                                                        setEditingTeamId(team.id)
                                                        setEditingTeamName(team.name)
                                                    }}
                                                    className="btn btn-secondary"
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeam(team.id)}
                                                    className="btn btn-danger"
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
                <div>
                    <div className={styles.settingsCard}>
                        <h3>契約状況</h3>

                        {(() => {
                            const status = office.subscription_status
                            const isActive = ['active', 'trialing', 'past_due', 'unpaid'].includes(status || '')

                            if (isActive) {
                                if (office.cancel_at_period_end) {
                                    return (
                                        <div className="alert alert-warning">
                                            <p><strong>⚠️ 解約予約済みです</strong></p>
                                            <p>
                                                {formatDate(office.current_period_end)} までご利用いただけます。<br />
                                                その後、自動的に解約されます。
                                            </p>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="alert alert-success">
                                            <p><strong>✅ 契約中（自動更新）</strong></p>
                                            <p>次回更新日: {formatDate(office.current_period_end)}</p>
                                        </div>
                                    )
                                }
                            } else if (status === 'canceled') {
                                return (
                                    <div className="alert alert-neutral">
                                        <p>現在は解約済みです。</p>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className="alert alert-info">
                                        <p>サブスクリプションのご契約はこちらから</p>
                                    </div>
                                )
                            }
                        })()}

                        <div className="mt-4">
                            <a href="/api/subscription/portal" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                                契約内容の確認・変更・解約
                            </a>
                        </div>
                    </div>

                    <div className={styles.settingsCard}>
                        <h3>会社情報の編集</h3>
                        {officeMessage.text && (
                            <div className={`alert ${officeMessage.type === 'success' ? 'alert-success' : 'alert-warning'}`}>
                                {officeMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateOffice}>
                            <div className="form-group">
                                <label className="form-label">会社名</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={officeName}
                                    onChange={(e) => setOfficeName(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isUpdatingOffice}>
                                {isUpdatingOffice ? '保存中...' : '保存'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
