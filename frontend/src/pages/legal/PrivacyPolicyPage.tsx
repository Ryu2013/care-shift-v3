import LegalPage from './LegalPage'

const sections = [
  {
    title: '1. 取得する情報',
    body: '本サービスでは、アカウント情報、事業所情報、シフト情報、勤怠情報、チャット情報など、サービス提供に必要な範囲の情報を取得します。',
  },
  {
    title: '2. 利用目的',
    body: '取得した情報は、本人確認、機能提供、問い合わせ対応、障害対応、サービス改善のために利用します。',
  },
  {
    title: '3. 第三者提供',
    body: '法令に基づく場合を除き、本人の同意なく第三者へ個人情報を提供しません。',
  },
  {
    title: '4. 安全管理',
    body: '不正アクセス、漏えい、改ざん等の防止に努め、必要な安全管理措置を講じます。',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="プライバシーポリシー"
      lead="本ページは公開ルートとして表示されます。運用方針に合わせて正式な文面へ更新してください。"
      sections={sections}
    />
  )
}
