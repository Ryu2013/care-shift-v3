import React from 'react';
import styles from './FadeInText.module.css';

interface FadeInTextProps {
    text: string;
}

export const FadeInText: React.FC<FadeInTextProps> = ({ text }) => {
    return (
        <div className={styles.container}>
            {text.split('').map((char, index) => (
                char === '\n' ? (
                    <br key={index} />
                ) : (
                    <span
                        key={index}
                        className={styles.char}
                        style={{ animationDelay: `${index * 0.08}s` }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                )
            ))}
        </div>
    );
};
