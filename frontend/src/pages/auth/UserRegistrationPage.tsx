import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../../api/auth'
import GoogleLoginButton from '../../components/GoogleLoginButton'
import { extractErrorMessage } from '../../utils/extractErrorMessage'
import styles from './UserRegistrationPage.module.css'

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
            <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>

                <div className="text-center mb-8">
                    <h2 className={`${styles.title} text-[1.8rem] mb-2`}>新規アカウント作成</h2>
                    <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>ケアシフトを利用開始するための<br />アカウント情報を入力してください。</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className={`${styles.label} block text-[0.9rem]`}>
                            お名前
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            placeholder="山田 太郎"
                            className={`${styles.input} w-full px-4 py-3 text-base`}
                        />
                    </div>

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
                            placeholder="example@email.com"
                            className={`${styles.input} w-full px-4 py-3 text-base`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={`${styles.label} block text-[0.9rem]`}>
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="6文字以上"
                            className={`${styles.input} w-full px-4 py-3 text-base`}
                        />
                    </div>

                    {error && <p className={`${styles.errorText} text-sm mt-1`}>{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
                        >
                            {loading ? '登録中...' : 'アカウントを作成'}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className={`${styles.dividerLine} flex-1 border-t`}></div>
                    <span className={`${styles.dividerText} px-4 text-[0.9rem]`}>または</span>
                    <div className={`${styles.dividerLine} flex-1 border-t`}></div>
                </div>

                {/* Google Registration */}
                <div className="mb-8">
                    <GoogleLoginButton buttonText="Googleで登録" />
                </div>

                {/* Footer Links */}
                <div className="text-center text-[0.9rem]">
                    <span className={`${styles.mutedText} text-[0.85rem]`}>すでにアカウントをお持ちですか？</span><br />
                    <Link to="/login" className={`${styles.primaryLink} inline-block mt-1`}>
                        ログインはこちら
                    </Link>
                </div>
            </div>
        </div>
    )
}
