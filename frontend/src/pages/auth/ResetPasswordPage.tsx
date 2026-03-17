import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('reset_password_token')

    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setErrorMsg('無効なリンクです。再度パスワードリセットをリクエストしてください。')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        if (password !== passwordConfirmation) {
            setErrorMsg('パスワードが一致しません')
            return
        }

        if (password.length < 8) {
            setErrorMsg('パスワードは8文字以上で入力してください')
            return
        }

        setLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            await resetPassword(token, password, passwordConfirmation)
            setSuccessMsg('パスワードが正常に変更されました。ログイン画面に移動します...')

            // 数秒後にログイン画面へ遷移
            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 3000)
        } catch (err: any) {
            setErrorMsg(err.message || 'パスワードのリセットに失敗しました。リンクの有効期限が切れている可能性があります。')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-[100vh] flex items-center justify-center p-8">
                <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm text-center">
                    <AlertMessage type="error" message={errorMsg} />
                    <Link to="/password-reset" className="text-[#5daaf5] font-bold mt-4 inline-block hover:underline">
                        パスワード再設定をやり直す
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center p-8">
            <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">新しいパスワードの設定</h2>
                    <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">
                        新しいパスワードを入力してください。<br />
                        （8文字以上の半角英数字）
                    </p>
                </div>

                <AlertMessage type="success" message={successMsg} />
                <AlertMessage type="error" message={errorMsg} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
                            新しいパスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="新しいパスワード"
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
                            新しいパスワード（確認用）
                        </label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength={8}
                            placeholder="もう一度入力してください"
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !password || !passwordConfirmation || !!successMsg}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-full text-[1.1rem] transition-all duration-200 hover:bg-[#4a90e2] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '設定中...' : 'パスワードを変更する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
