import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { signIn } from '../api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      navigate('/shifts')
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100vh] flex items-center justify-center p-8">
      {/* Background matches v2 auth-container style (which often has a separate bg, setting a neutral base here) */}
      <div className="absolute inset-0 bg-gray-50 -z-10"></div>

      <div className="w-full max-w-[480px] p-10 rounded-2xl bg-white/40 backdrop-blur-[3px] border border-[#eef2f6] shadow-sm transition-all animate-fade-in-up">

        <div className="text-center mb-8">
          <h2 className="text-[#333] text-[1.8rem] font-bold mb-2">ログイン</h2>
          <p className="text-[#888] mb-0 text-[0.9rem] leading-snug">お疲れ様です。<br />アカウントにログインしてください。</p>
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

          <div className="space-y-2">
            <label className="block text-[0.9rem] font-bold text-[#444]">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#e1e4e8]"></div>
          <span className="px-4 text-[#999] text-[0.9rem]">または</span>
          <div className="flex-1 border-t border-[#e1e4e8]"></div>
        </div>

        {/* Google Login */}
        <div className="mb-8">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white text-[#3c4043] border border-[#dadce0] font-medium py-3 px-4 rounded-full transition-all duration-200 hover:bg-[#f8faff] hover:shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Googleでログイン</span>
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center text-[0.9rem]">
          <span className="text-[#888] text-[0.85rem]">アカウントをお持ちでないですか？</span><br />
          <Link to="/register" className="text-[#5daaf5] font-bold no-underline hover:underline inline-block mt-1">
            新規登録はこちら
          </Link>
          <div className="mt-2 text-[0.85rem]">
            <Link to="/password-reset" className="text-[#888] no-underline hover:text-[#5daaf5]">
              パスワードをお忘れの場合
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
