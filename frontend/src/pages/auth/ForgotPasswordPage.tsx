import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'
import styles from './ForgotPasswordPage.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMsg(null)
        setErrorMsg(null)

        try {
            const response = await requestPasswordReset(email)
            setSuccessMsg(response.data.message || 'パスワード再設定用のメールを送信しました。')
            setEmail('')
        } catch (err: any) {
            setErrorMsg(err.message || 'エラーが発生しました。メールアドレスをご確認ください。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center p-8">
            <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>

                <div className="text-center mb-8">
                    <h2 className={`${styles.title} text-[1.8rem] mb-2`}>パスワードの再設定</h2>
                    <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>
                        ご登録のメールアドレスを入力してください。<br />
                        パスワード再設定用のリンクをお送りします。
                    </p>
                </div>

                <AlertMessage type="success" message={successMsg} />
                <AlertMessage type="error" message={errorMsg} />

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

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
                        >
                            {loading ? '送信中...' : '再設定メールを送信'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className={`${styles.backLink} text-[0.85rem]`}>
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
