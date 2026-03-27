import { Link } from 'react-router-dom'
import styles from './LegalPage.module.css'

type LegalSection = {
  title: string
  body: string
}

type LegalPageProps = {
  title: string
  lead: string
  sections: LegalSection[]
}

export default function LegalPage({ title, lead, sections }: LegalPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.card}>
          <Link to="/" className="text-sm text-[var(--blue-dark)] hover:underline">ホームへ戻る</Link>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>

          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.text}>{section.body}</p>
            </section>
          ))}

        </div>
      </div>
    </div>
  )
}
