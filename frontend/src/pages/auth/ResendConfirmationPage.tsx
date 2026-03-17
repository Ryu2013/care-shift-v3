import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resendConfirmation } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'

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
            <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">確認メールの再送</h2>
                    <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">
                        登録時に入力したメールアドレスを入力してください。<br />
                        アカウント有効化のための確認メールを再送します。
                    </p>
                </div>

                <AlertMessage type="success" message={message} />
                <AlertMessage type="error" message={error} />

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
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
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-full text-[1.1rem] transition-all duration-200 hover:bg-[#4a90e2] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '送信中...' : '確認メールを再送する'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[#888] text-[0.9rem] font-bold no-underline hover:text-[#5daaf5] transition-colors">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
