import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { signIn } from '../../api/auth'
import apiClient from '../../api/rails-api'
import type { User } from '../../types'
import AlertMessage from '../../components/AlertMessage'
import GoogleLoginButton from '../../components/GoogleLoginButton'
import { extractErrorMessage } from '../../utils/extractErrorMessage'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpAttempt, setOtpAttempt] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(
        errorParam === 'confirmation_failed'
          ? '確認リンクが無効か、すでに使用済み、または期限切れの可能性があります。確認メールを再送してからもう一度お試しください。'
          : errorParam
      )
      searchParams.delete('error')
      setSearchParams(searchParams)
    }

    const confirmed = searchParams.get('confirmed')
    if (confirmed === 'true') {
      setSuccessMsg('メールアドレスの確認が完了しました。ログインできます。')
      searchParams.delete('confirmed')
      setSearchParams(searchParams)
    }

    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMsg('確認メールを送信しました。メール内のリンクを開いてからログインしてください。')
      searchParams.delete('registered')
      setSearchParams(searchParams)
    }

    const unlocked = searchParams.get('unlocked')
    if (unlocked === 'true') {
      setSuccessMsg('アカウントのロックが解除されました。新しいパスワードでログインしてください。')
      // URLからパラメータを消去してリロード時などに再度表示されないようにする
      searchParams.delete('unlocked')
      setSearchParams(searchParams)
    } else if (unlocked === 'false') {
      setError('ロック解除用リンクが無効か、すでに解除されています。')
      searchParams.delete('unlocked')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await signIn(email, password, otpAttempt, rememberMe)
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      const res = await apiClient.get<User>('/me')
      const user = res.data

      if (user.role === 'admin') {
        navigate('/shifts')
      } else {
        navigate('/user-shifts')
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'ログインに失敗しました。入力内容をご確認ください。'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100vh] flex items-center justify-center p-8">


      <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>

        <div className="text-center mb-8">
          <h2 className={`${styles.title} text-[1.8rem] mb-2`}>ログイン</h2>
          <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>お疲れ様です。<br />アカウントにログインしてください。</p>
        </div>

        <AlertMessage type="success" message={successMsg} />
        <AlertMessage type="error" message={error} />

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

          <div className="space-y-2">
            <label className={`${styles.label} block text-[0.9rem]`}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={`${styles.input} w-full px-4 py-3 text-base`}
            />
          </div>

          <div className="space-y-2">
            <label className={`${styles.label} block text-[0.9rem]`}>
              二段階認証コード (設定済みの場合)
            </label>
            <input
              type="text"
              value={otpAttempt}
              onChange={(e) => setOtpAttempt(e.target.value)}
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="6桁のコード"
              className={`${styles.input} w-full px-4 py-3 text-base`}
            />
          </div>

          <div className="flex items-center pt-1 pb-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={`${styles.checkbox} h-4 w-4 rounded border-gray-300`}
            />
            <label htmlFor="remember-me" className={`${styles.checkboxLabel} ml-2 block text-sm cursor-pointer`}>
              ログイン状態を保存する
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className={`${styles.dividerLine} flex-1 border-t`}></div>
          <span className={`${styles.dividerText} px-4 text-[0.9rem]`}>または</span>
          <div className={`${styles.dividerLine} flex-1 border-t`}></div>
        </div>

        {/* Google Login */}
        <div className="mb-8">
          <GoogleLoginButton buttonText="Googleでログイン" />
        </div>

        {/* Footer Links */}
        <div className="text-center text-[0.9rem]">
          <span className={`${styles.mutedText} text-[0.85rem]`}>アカウントをお持ちでないですか？</span><br />
          <Link to="/register" className={`${styles.primaryLink} inline-block mt-1`}>
            新規登録はこちら
          </Link>
          <div className="mt-2 text-[0.85rem]">
            <Link to="/password-reset" className={styles.secondaryLink}>
              パスワードをお忘れの場合
            </Link>
          </div>
          <div className="mt-2 text-[0.85rem]">
            <Link to="/resend-confirmation" className={styles.secondaryLink}>
              確認メールが届いていない場合
            </Link>
          </div>
          <div className="mt-2 text-[0.85rem]">
            <Link to="/unlock" className={styles.secondaryLink}>
              アカウントがロックされた場合
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
