import LegalPage from './LegalPage'

const sections = [
  {
    title: '販売事業者',
    body: '事業者名、所在地、連絡先は正式情報に差し替えてください。',
  },
  {
    title: '販売価格',
    body: '無料提供中です。将来有料化する場合は、料金、課金方法、支払時期を明記してください。',
  },
  {
    title: '提供時期',
    body: 'アカウント登録完了後、直ちに利用できます。',
  },
  {
    title: '返品・解約',
    body: 'デジタルサービスの性質上、提供開始後の返品には応じられません。解約条件がある場合はここに記載してください。',
  },
]

export default function SpecifiedCommercialTransactionsPage() {
  return (
    <LegalPage
      title="特定商取引法に基づく表記"
      lead="このページも公開ルートです。将来の有料化を見据えて、必要な法定表示をここに整理できます。"
      sections={sections}
    />
  )
}
