import { useState } from 'react'
import { Header } from '../../../components/Header'
import { subscribe } from '../../../api/subscription'
import styles from './SubscriptionPage.module.css'

export default function SubscriptionPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async () => {
        setIsLoading(true)
        try {
            const response = await subscribe()
            if (response.data && response.data.url) {
                // Redirect to Stripe Checkout Session URL
                window.location.href = response.data.url
            } else {
                alert('チェックアウトURLの取得に失敗しました。')
            }
        } catch (error) {
            console.error('Failed to create checkout session', error)
            alert('チェックアウトの準備中にエラーが発生しました。')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="pt-28 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
                <div className={`${styles.container} p-8 sm:p-12`}>
                    <h1 className={`${styles.title} text-3xl text-center mb-12`}>プラン選択</h1>

                    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                        {/* Free Plan */}
                        <div className={`${styles.planCard} flex-1 max-w-sm flex flex-col w-full mx-auto`}>
                            <div className="p-8 flex flex-col h-full">
                                <h2 className={`${styles.planName} text-2xl mb-2`}>無料プラン</h2>
                                <p className={`${styles.planDescription} text-sm mb-6`}>小規模なチームに最適です。</p>

                                <div className={`${styles.planPrice} text-4xl mb-8`}>
                                    ¥0 <span className={`${styles.planPriceSpan} text-base`}>/月</span>
                                </div>

                                <ul className={`${styles.featuresList} flex-grow mb-8 space-y-4`}>
                                    <li className="pl-6">ユーザー数: 5名まで</li>
                                    <li className="pl-6">基本的なシフト管理</li>
                                    <li className="pl-6">チャット機能</li>
                                </ul>

                                <div className={`${styles.btn} ${styles.btnDisabled} py-4 w-full`}>
                                    現在のプラン
                                </div>
                            </div>
                        </div>

                        {/* Paid Plan */}
                        <div className={`${styles.planCard} ${styles.planCardFeatured} flex-1 max-w-sm flex flex-col w-full mx-auto`}>
                            <div className={`${styles.featuredBadge} text-center py-2 text-sm`}>
                                おすすめ
                            </div>
                            <div className="p-8 flex flex-col h-full">
                                <h2 className={`${styles.planName} text-2xl mb-2`}>スタンダードプラン</h2>
                                <p className={`${styles.planDescription} text-sm mb-6`}>成長中のチーム向け。</p>

                                <div className={`${styles.planPrice} text-4xl mb-8`}>
                                    ¥300 <span className={`${styles.planPriceSpan} text-base`}>/ユーザー/月</span>
                                </div>

                                <ul className={`${styles.featuresList} flex-grow mb-8 space-y-4`}>
                                    <li className="pl-6">ユーザー数: 無制限</li>
                                    <li className="pl-6">6人目以降は従量課金</li>
                                    <li className="pl-6">全ての機能を利用可能</li>
                                    <li className="pl-6">優先サポート</li>
                                </ul>

                                <button
                                    onClick={handleSubscribe}
                                    disabled={isLoading}
                                    className={`${styles.btn} ${isLoading ? styles.btnLoading : styles.btnPrimary} py-4 w-full`}
                                >
                                    {isLoading ? '準備中...' : 'Stripeで決済する'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
