import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../../api/auth'
import GoogleLoginButton from '../../components/GoogleLoginButton'
import { extractErrorMessage } from '../../utils/extractErrorMessage'

export default function UserRegistrationPage() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await signUp({ name, email, password })
            navigate('/login?registered=true')
        } catch (err) {
            setError(extractErrorMessage(err, '登録に失敗しました。入力内容をご確認ください。'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center p-8">
            <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">新規アカウント作成</h2>
                    <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">ケアシフトを利用開始するための<br />アカウント情報を入力してください。</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
                            お名前
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            placeholder="山田 太郎"
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

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
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[0.9rem] font-bold text-[#444]">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="6文字以上"
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-full text-[1.1rem] transition-all duration-200 hover:bg-[#4a90e2] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '登録中...' : 'アカウントを作成'}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-[#e1e4e8]"></div>
                    <span className="px-4 text-[#999] text-[0.9rem]">または</span>
                    <div className="flex-1 border-t border-[#e1e4e8]"></div>
                </div>

                {/* Google Registration */}
                <div className="mb-8">
                    <GoogleLoginButton buttonText="Googleで登録" />
                </div>

                {/* Footer Links */}
                <div className="text-center text-[0.9rem]">
                    <span className="text-[#888] text-[0.85rem]">すでにアカウントをお持ちですか？</span><br />
                    <Link to="/login" className="text-[#5daaf5] font-bold no-underline hover:underline inline-block mt-1">
                        ログインはこちら
                    </Link>
                </div>
            </div>
        </div>
    )
}
