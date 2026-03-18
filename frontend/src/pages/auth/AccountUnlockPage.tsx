import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendUnlockEmail } from '../../api/auth'
import styles from './AccountUnlockPage.module.css'

export default function AccountUnlockPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setError(null)
        try {
            await sendUnlockEmail(email)
            setMessage('アカウントがロックされている場合、数分以内にロック解除手順を記載したメールが送信されます。')
            setEmail('')
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors.join('、 '))
            } else if (err.response?.status === 422) {
                setError('メールアドレスが見つからないか、アカウントはロックされていません。')
            } else {
                setError('メールの送信に失敗しました。時間をおいて再度お試しください。')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center p-8">
            <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>

                <div className="text-center mb-8">
                    <h2 className={`${styles.title} text-[1.8rem] mb-2`}>アカウントのロック解除</h2>
                    <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>
                        アカウントに登録されているメールアドレスを入力してください。<br />
                        ロックを解除するためのリンクを送信します。
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className={`${styles.label} block text-[0.9rem]`}>
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            autoFocus
                            placeholder="example@email.com"
                            className={`${styles.input} w-full px-4 py-3 text-base`}
                        />
                    </div>

                    {message && <p className={`${styles.successText} text-sm mt-1`}>{message}</p>}
                    {error && <p className={`${styles.errorText} text-sm mt-1`}>{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
                        >
                            {loading ? '送信中...' : 'ロック解除メールを送信'}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="text-center mt-8">
                    <Link to="/login" className={`${styles.footerLink} inline-block`}>
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
