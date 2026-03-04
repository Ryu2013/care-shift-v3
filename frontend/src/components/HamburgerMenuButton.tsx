import React, { useState } from 'react';
import styles from './HamburgerMenuButton.module.css';

interface HamburgerMenuButtonProps {
    children: React.ReactNode;
    className?: string;
    buttonClassName?: string;
}

export const HamburgerMenuButton: React.FC<HamburgerMenuButtonProps> = ({ children, className = '', buttonClassName = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // もしドロワー内のリンク（aタグやbuttonなど）がクリックされたらメニューを閉じる
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
            // ただし、ハンバーガーボタン自体をクリックした場合は toggleMenu で処理するため除外
            if (target.closest(`.${styles.hamburgerBtn}`)) return;
            setIsOpen(false);
        }
    };

    return (
        <div className={className}>
            <button
                className={`${styles.hamburgerBtn} ${isOpen ? styles.menuOpen : ''} ${buttonClassName}`}
                onClick={toggleMenu}
                aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
            >
                <span className={styles.hamburgerIcon}></span>
            </button>

            {/* モバイル用ドロワーメニュー */}
            {isOpen && (
                <div className={styles.mobileMenu} onClick={handleContainerClick}>
                    {children}
                </div>
            )}
        </div>
    );
};
