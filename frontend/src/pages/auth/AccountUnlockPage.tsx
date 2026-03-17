import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendUnlockEmail } from '../../api/auth'

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
            <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

                <div className="text-center mb-8">
                    <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">アカウントのロック解除</h2>
                    <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">
                        アカウントに登録されているメールアドレスを入力してください。<br />
                        ロックを解除するためのリンクを送信します。
                    </p>
                </div>

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

                    {message && <p className="text-green-600 text-sm mt-1">{message}</p>}
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-full text-[1.1rem] transition-all duration-200 hover:bg-[#4a90e2] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '送信中...' : 'ロック解除メールを送信'}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="text-center mt-8">
                    <Link to="/login" className="text-[#5daaf5] font-bold no-underline hover:underline inline-block">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
