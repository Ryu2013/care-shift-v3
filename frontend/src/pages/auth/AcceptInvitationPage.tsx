import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { acceptInvitation } from '../../api/auth'
import AlertMessage from '../../components/AlertMessage'
import { extractErrorMessage } from '../../utils/extractErrorMessage'
import styles from './AcceptInvitationPage.module.css'

export default function AcceptInvitationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('invitation_token')

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!invitationToken) {
      setErrorMessage('無効な招待リンクです。招待メールを再確認してください。')
      return
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    acceptInvitation(invitationToken, password, passwordConfirmation, name || undefined)
      .then(() => {
        setSuccessMessage('招待の承認が完了しました。ログイン画面へ移動します。')
        window.setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      })
      .catch((error: unknown) => {
        setErrorMessage(extractErrorMessage(error, '招待の承認に失敗しました。リンクの有効期限が切れている可能性があります。'))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (!invitationToken) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center p-8">
        <div className={`${styles.card} w-full max-w-[480px] p-10 text-center`}>
          <AlertMessage type="error" message="無効な招待リンクです。招待メールを再確認してください。" />
          <Link to="/login" className={`${styles.primaryLink} mt-4 inline-block`}>
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100vh] flex items-center justify-center p-8">
      <div className={`${styles.card} w-full max-w-[480px] p-10 transition-all animate-fade-in-up`}>
        <div className="text-center mb-8">
          <h2 className={`${styles.title} text-[1.8rem] mb-2`}>招待を承認する</h2>
          <p className={`${styles.description} mb-0 text-[0.9rem] leading-snug`}>
            初回ログイン用のパスワードを設定してください。<br />
            必要ならお名前もここで変更できます。
          </p>
        </div>

        <AlertMessage type="success" message={successMessage} />
        <AlertMessage type="error" message={errorMessage} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`${styles.label} block text-[0.9rem]`}>
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="必要なら変更してください"
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
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="8文字以上"
              className={`${styles.input} w-full px-4 py-3 text-base`}
            />
          </div>

          <div className="space-y-2">
            <label className={`${styles.label} block text-[0.9rem]`}>
              パスワード（確認用）
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="もう一度入力してください"
              className={`${styles.input} w-full px-4 py-3 text-base`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !password || !passwordConfirmation || !!successMessage}
              className={`${styles.submitButton} w-full flex justify-center py-3.5 px-4 text-[1.1rem] cursor-pointer`}
            >
              {loading ? '承認中...' : '招待を承認する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
