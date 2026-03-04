import styles from './HowToUse.module.css';

export default function HowToUsePage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">使い方ページ</h1>

            <div className={`${styles.card} p-5 shadow-sm`}>
                <p className="mb-4">当アプリケーションは重度訪問介護向け業務効率化アプリケーションです。</p>
                <p className="mb-4">各機能の使い方については、上部のナビゲーションメニューから選択してください。</p>
                <p className="mb-4">全ての機能でスマートフォン、タブレット、PCからご利用いただけます。</p>
                <p className="mb-4">ご不明な点がございましたら、下記までお問い合わせください。</p>

                <p className="mt-6 font-medium text-gray-700">お問い合わせ先: kaigo2013.ryuuiti@gmail.com</p>
            </div>
        </>
    );
}
