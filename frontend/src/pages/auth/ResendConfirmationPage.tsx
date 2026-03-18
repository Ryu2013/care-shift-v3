import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resendConfirmation } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'
import styles from './ResendConfirmationPage.module.css'

export default function ResendConfirmationPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            await resendConfirmation(email)
            setMessage('確認メールを再送しました。メールボックスをご確認ください。')
            setEmail('')
        } catch (err: any) {
            if (err.response?.status === 404 || err.response?.status === 422) {
                // Deviseの仕様上、登録されていないメールアドレスや既に確認済みの場合はエラーになることがある
                setError('有効なメールアドレスを入力してください、または既に確認済みです。')
            } else {
                setError('確認メールの再送に失敗しました。時間をおいて再度お試しください。')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center p-8">
            <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>

                <div className="text-center mb-8">
                    <h2 className={`${styles.title} text-[1.8rem] mb-2`}>確認メールの再送</h2>
                    <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>
                        登録時に入力したメールアドレスを入力してください。<br />
                        アカウント有効化のための確認メールを再送します。
                    </p>
                </div>

                <AlertMessage type="success" message={message} />
                <AlertMessage type="error" message={error} />

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className={`${styles.label} block text-[0.9rem]`}>
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="example@email.com"
                            className={`${styles.input} w-full px-4 py-3 text-base`}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
                        >
                            {loading ? '送信中...' : '確認メールを再送する'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className={`${styles.backLink} text-[0.9rem] transition-colors`}>
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
