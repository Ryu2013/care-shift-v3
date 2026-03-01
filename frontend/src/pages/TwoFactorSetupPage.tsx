import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTwoFactorSetup, confirmTwoFactor } from '../api/auth'
import { QRCodeSVG } from 'qrcode.react'

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
            <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">読み込み中...</p>
            </div>
        )
    }

    if (!setupData) {
        return (
            <div className="p-8">
                <p className="text-red-500">設定の読み込みに失敗しました。</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">二段階認証セットアップ</h2>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                <p className="mb-6 text-gray-600">
                    二段階認証アプリ（Google Authenticator等）で下記の QR コードをスキャンしてください。
                </p>

                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-xl">
                        <QRCodeSVG value={setupData.qr_uri} size={200} />
                    </div>
                </div>

                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">QR コードが使用できない場合は、下記のセットアップキーを手入力してください。</p>
                    <div className="font-mono text-center font-bold text-lg tracking-widest text-[#5daaf5]">
                        {setupData.secret_key.match(/.{1,4}/g)?.join(" ") || setupData.secret_key}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
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
                            className="w-full px-4 py-3 text-base border-2 border-[#e1e4e8] rounded-lg bg-[#fafbfc] transition-all duration-200 focus:outline-none focus:border-[#5daaf5] focus:bg-white focus:ring-[3px] focus:ring-[#5daaf5]/10"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || otpAttempt.length !== 6}
                            className="w-full flex justify-center bg-[#5daaf5] text-white font-bold py-3.5 px-4 rounded-lg text-lg transition-all duration-200 hover:bg-[#4a90e2] disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? '有効化中...' : '有効化する'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6 mt-4">
                    セットアップが完了したら、次回ログイン時に二段階認証アプリのコード入力が求められます。
                </p>
            </div>
        </div>
    )
}
