import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTwoFactorSetup, confirmTwoFactor } from '../../api/auth'
import { QRCodeSVG } from 'qrcode.react'
import { Header } from '../../components/Header'
import styles from './TwoFactorSetupPage.module.css'

export default function TwoFactorSetupPage() {
    const navigate = useNavigate()
    const [otpAttempt, setOtpAttempt] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Fetch the QR code URI and secret key
    const { data: setupData, isLoading: isSetupLoading } = useQuery({
        queryKey: ['twoFactorSetup'],
        queryFn: async () => {
            const res = await getTwoFactorSetup()
            return res.data
        },
        // Don't refetch on window focus because secret key regenerates if not confirmed
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await confirmTwoFactor(otpAttempt)
            alert("二段階認証を有効化しました")
            navigate('/settings') // Or redirect to home/shifts
        } catch {
            setError('認証コードが正しくありません。再度入力してください。')
        } finally {
            setLoading(false)
        }
    }

    if (isSetupLoading) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <p className="text-gray-500">読み込み中...</p>
                </div>
            </div>
        )
    }

    if (!setupData) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="pt-28 pb-8 px-4 max-w-2xl mx-auto">
                    <p className={`${styles.errorText} text-center`}>設定の読み込みに失敗しました。</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Header />
            <div className="pt-28 pb-8 px-4 sm:px-6 max-w-2xl mx-auto">
                <div className={`${styles.container} p-6 sm:p-10`}>
                    <h2 className={`${styles.title} text-2xl mb-8 text-center`}>二段階認証セットアップ</h2>

                    <div className={`${styles.card} p-6 sm:p-8 mb-8`}>
                        <p className={`${styles.description} text-sm sm:text-base leading-relaxed text-center mb-8`}>
                            二段階認証アプリ（Google Authenticator等）で下記の QR コードをスキャンしてください。
                        </p>

                        <div className="flex justify-center mb-8">
                            <div className={`${styles.qrContainer} p-4`}>
                                <QRCodeSVG value={setupData.qr_uri} size={180} />
                            </div>
                        </div>

                        <div className={`${styles.secretKeyBox} p-5 text-center mb-8`}>
                            <p className={`${styles.description} text-xs sm:text-sm mb-3`}>
                                QR コードが使用できない場合は、下記のセットアップキーを手入力してください。
                            </p>
                            <div className={`${styles.secretKeyText} font-mono text-lg sm:text-xl break-all`}>
                                {setupData.secret_key.match(/.{1,4}/g)?.join(" ") || setupData.secret_key}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className={`${styles.label} block text-sm mb-2`}>
                                    二段階認証アプリの6桁コード
                                </label>
                                <input
                                    type="text"
                                    value={otpAttempt}
                                    onChange={(e) => setOtpAttempt(e.target.value)}
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    placeholder="123456"
                                    className={`${styles.input} w-full px-4 py-3 text-lg text-center tracking-widest`}
                                />
                            </div>

                            {error && <p className={`${styles.errorText} text-sm text-center`}>{error}</p>}

                            <button
                                type="submit"
                                disabled={loading || otpAttempt.length !== 6}
                                className={`w-full py-4 text-lg flex justify-center items-center ${styles.btnPrimary}`}
                            >
                                {loading ? '有効化中...' : '有効化する'}
                            </button>
                        </form>

                        <p className={`${styles.description} text-xs text-center mt-6`}>
                            セットアップが完了したら、次回ログイン時に二段階認証アプリのコード入力が求められます。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
