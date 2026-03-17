import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'

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
            <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">パスワードの再設定</h2>
                    <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">
                        ご登録のメールアドレスを入力してください。<br />
                        パスワード再設定用のリンクをお送りします。
                    </p>
                </div>

                <AlertMessage type="success" message={successMsg} />
                <AlertMessage type="error" message={errorMsg} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
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
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-full text-[1.1rem] transition-all duration-200 hover:bg-[#4a90e2] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '送信中...' : '再設定メールを送信'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-[#888] text-[0.85rem] no-underline hover:text-[#5daaf5]">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
