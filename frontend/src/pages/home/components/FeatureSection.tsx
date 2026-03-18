import React from 'react'
import homeStyles from '../HomePage.module.css'
import styles from './FeatureSection.module.css'

export interface FeatureImageItem {
  src: string
  alt: string
  className?: string
}

export interface FeatureSectionProps {
  title: string
  highlightText: string
  descriptionLines: string[]
  imageItems: FeatureImageItem[]
  reverse?: boolean
  background?: boolean
  imageLayout?: string
  imageFrame?: string
}

export default function FeatureSection({
  title,
  highlightText,
  descriptionLines,
  imageItems,
  reverse = false,
  background = false,
  imageLayout = 'flex-1 w-full',
  imageFrame = `${styles.featureFrame} max-w-sm`,
}: FeatureSectionProps) {
  return (
    <section className={`${background ? styles.featureSectionAlt : styles.featureSection} py-20 px-6 md:px-12 ${background ? 'bg-opacity-50' : ''}`}>
      <div className={`max-w-5xl mx-auto flex flex-col items-center gap-12 md:gap-20 ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className={`flex-1 ${homeStyles.scrollTrigger}`}>
          <h2 className={`${styles.featureTitle} mb-6`}>
            {title}
            <br />
            <span className={styles.featureTitleHighlight}>{highlightText}</span>
          </h2>
          <p className={`${styles.featureDesc} text-lg`}>
            {descriptionLines.map((line, index) => (
              <React.Fragment key={line}>
                {line}
                {index < descriptionLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className={`${imageLayout} ${homeStyles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
          <div className={imageFrame}>
            {imageItems.map((image) => (
              <img key={image.alt} src={image.src} alt={image.alt} className={image.className} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
