import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/rails-api';
import type { User } from '../../types';
import styles from './HomePage.module.css';
import { FadeInText } from './components/FadeInText';
import { HamburgerMenuButton } from '../../components/HamburgerMenuButton';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import logoImg from '../../assets/logo.png';
import titleImg from '../../assets/title.png';
import calendarImg from '../../assets/calendar.png';
import clockImg from '../../assets/clock.png';
import chatImg from '../../assets/chat.png';
import naviImg from '../../assets/navi.png';
import humanImg from '../../assets/human.png';
import shiftsImg from '../../assets/shifts.png';
import clientNeedImg from '../../assets/client_need.png';
import workStatusesImg from '../../assets/work_statuses.png';
import chatViewImg from '../../assets/chat_view.png';
import navViewImg from '../../assets/nav_view.png';
import shift4Img from '../../assets/shift4.png';
import footerTitleImg from '../../assets/footer_title.png';


const ResponsiveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mx-auto mb-4 text-[#69C5FF]">
        <rect x="4" y="2" width="16" height="12" rx="2"></rect>
        <rect x="8" y="18" width="8" height="4" rx="1"></rect>
        <path d="M12 14v4"></path>
        <path d="M20 10h2"></path>
        <path d="M2 10h2"></path>
    </svg>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get<User>('/me');
                if (res.data.role === 'admin') {
                    navigate('/shifts', { replace: true });
                } else {
                    navigate('/user-shifts', { replace: true });
                }
            } catch {
                // 未ログイン状態
            }
        };
        checkAuth();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.isVisible);
                }
            });
        }, { threshold: 0.1 });

        const triggers = document.querySelectorAll(`.${styles.scrollTrigger}`);
        triggers.forEach(trigger => observer.observe(trigger));

        return () => {
            triggers.forEach(trigger => observer.unobserve(trigger));
        };
    }, [navigate]);

    return (
        <div>
            {/* --- ヘッダー --- */}
            <header className={`${styles.header} py-4 px-6 md:px-12 w-full fixed top-0 z-50 `}>
                <div className="mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="ケアシフト ロゴ" className="h-8" />
                        <span className={`${styles.logoText} md:text-lg block tracking-wide`}>シフト管理アプリ</span>

                        {/* デスクトップ用ナビゲーション */}
                        <nav className="hidden md:flex items-center gap-6 ml-6">
                            <Link to="/how-to-use" className={styles.navLink}>使い方</Link>
                            <Link to="https://ryu2013.github.io/ryuuiti_memos/" className={styles.navLink}>運営者情報</Link>
                        </nav>
                    </div>

                    {/* デスクトップ用アクションボタン */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/register" className={styles.navLinkSignup}>新規登録</Link>
                        <Link to="/login" className={styles.navLinkLogin}>ログイン</Link>
                    </div>

                    {/* ハンバーガーボタン (モバイル用) */}
                    <HamburgerMenuButton className="md:hidden">
                        <nav className="flex flex-col items-center gap-8 pt-20">
                            <Link to="/how-to-use" className={styles.mobileNavLink}>使い方</Link>
                            <Link to="https://ryu2013.github.io/ryuuiti_memos/" className={styles.mobileNavLink}>運営者情報</Link>
                            <Link to="/register" className={styles.navLinkSignup}>新規登録</Link>
                            <Link to="/login" className={styles.navLinkLogin}>ログイン</Link>
                        </nav>
                    </HamburgerMenuButton>
                </div>
            </header>

            {/* --- メインビジュアル --- */}
            <section className={`${styles.heroSection} pt-28 pb-16 px-6 md:px-12 text-center`}>
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
                    <div className="relative mt-6 w-full md:mt-10">
                        <div className={`absolute top-0 left-0 -mt-6 md:-mt-10 ml-0 md:-ml-4 text-2xl md:text-5xl font-bold tracking-widest whitespace-nowrap z-10 ${styles.heroTitle}`}>
                            <FadeInText text={"訪問介護\n重度訪問介護\n業務効率化アプリ"} />
                        </div>
                        <img src={titleImg} alt="タイトル" className={`${styles.heroTitleImage} mt-10 md:mt-0`} />
                    </div>

                    <div className={`${styles.heroFeaturesContainer} flex flex-wrap justify-center gap-6 md:gap-12 py-6 px-4 w-full`}>
                        <div className="flex flex-col items-center gap-2 w-20">
                            <img src={calendarImg} alt="シフト管理" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span className={`${styles.heroFeatureItem} text-sm font-bold`}>シフト管理</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-20">
                            <img src={clockImg} alt="勤怠管理" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span className={`${styles.heroFeatureItem} text-sm font-bold`}>勤怠管理</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-20">
                            <img src={chatImg} alt="チャット" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span className={`${styles.heroFeatureItem} text-sm font-bold`}>チャット</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-20">
                            <img src={naviImg} alt="ナビ" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span className={`${styles.heroFeatureItem} text-sm font-bold`}>ナビ</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-20">
                            <img src={humanImg} alt="人員配置" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                            <span className={`${styles.heroFeatureItem} text-sm font-bold`}>人員配置</span>
                        </div>
                    </div>

                    <p className={`${styles.heroText} font-medium`}>複雑な管理業務を。<br className="md:hidden" />PCでもスマートフォンでも簡単に。</p>

                    <div className="flex flex-col items-center gap-4 w-full max-w-sm mt-4">
                        <Link to="/register" className={`${styles.btnPrimary} w-full py-4 text-center text-lg shadow-md hover:shadow-lg`}>
                            新規登録
                        </Link>
                        <GoogleLoginButton
                            buttonText="Googleで登録"
                            className={`${styles.btnGoogle} w-full py-3 flex items-center justify-center shadow-sm hover:shadow`}
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            アカウントを作成することで、
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">利用規約</a>
                            および<br className="md:hidden" />
                            <a href="/privacy_policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 mx-1">プライバシーポリシー</a>
                            に同意したものとみなします。
                        </p>
                    </div>
                </div>
            </section>

            {/* --- 特徴1: シフト登録 --- */}
            <section className={`${styles.featureSection} py-20 px-6 md:px-12`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className={`flex-1 ${styles.scrollTrigger}`}>
                        <h2 className={`${styles.featureTitle} mb-6`}>2クリックで<br /><span className={styles.featureTitleHighlight}>簡単にシフト登録!</span></h2>
                        <p className={`${styles.featureDesc} text-lg`}>担当者を選んでポチッとするだけ。<br />PCの大画面でも、スマホのタッチ操作でも<br />直感的に登録完了します。</p>
                    </div>
                    <div className={`flex-1 relative w-full ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="w-full max-w-md ml-auto mr-auto md:mr-0 transform hover:rotate-1 transition-transform duration-500">
                            <img src={shiftsImg} alt="シフト画面背景" className={styles.featureImg} />
                            <img src={clientNeedImg} alt="担当者選択ポップアップ" className="absolute -bottom-6 -right-6 w-3/5 rounded-lg shadow-2xl border border-gray-100" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴2: 勤怠管理 --- */}
            <section className={`${styles.featureSectionAlt} py-20 px-6 md:px-12 bg-opacity-50`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                    <div className={`flex-1 ${styles.scrollTrigger}`}>
                        <h2 className={`${styles.featureTitle} mb-6`}>勤怠管理も<br /><span className={styles.featureTitleHighlight}>らくらく!</span></h2>
                        <p className={`${styles.featureDesc} text-lg`}>出勤状況が一目瞭然。<br />管理の手間を大幅に削減します。</p>
                    </div>
                    <div className={`flex-1 w-full ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="w-full max-w-sm ml-auto mr-auto md:mr-0 transform hover:-rotate-1 transition-transform duration-500">
                            <img src={workStatusesImg} alt="出勤状況管理" className={styles.featureImg} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴3: 業務連絡 --- */}
            <section className={`${styles.featureSection} py-20 px-6 md:px-12`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className={`flex-1 ${styles.scrollTrigger}`}>
                        <h2 className={`${styles.featureTitle} mb-6`}>業務連絡も<br /><span className={styles.featureTitleHighlight}>簡単！</span></h2>
                        <p className={`${styles.featureDesc} text-lg`}>チャット機能も搭載<br />色々なアプリを行ったり来たりする必要はもうありません。</p>
                    </div>
                    <div className={`flex-1 w-full flex justify-center ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="w-full max-w-sm ml-auto mr-auto md:mr-0 transform hover:rotate-1 transition-transform duration-500">
                            <img src={chatViewImg} alt="チャット画面" className={styles.featureImg} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴4: ナビゲーション --- */}
            <section className={`${styles.featureSectionAlt} py-20 px-6 md:px-12 bg-opacity-50`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                    <div className={`flex-1 ${styles.scrollTrigger}`}>
                        <h2 className={`${styles.featureTitle} mb-6`}>ワンタップで<br /><span className={styles.featureTitleHighlight}>出勤らくらく!</span></h2>
                        <p className={`${styles.featureDesc} text-lg`}>ボタン一つで本日担当のお宅まで<br />ナビゲーション致します。</p>
                    </div>
                    <div className={`flex-1 w-full flex justify-center ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="w-full max-w-sm ml-auto mr-auto md:mr-0 transform hover:-rotate-1 transition-transform duration-500">
                            <img src={navViewImg} alt="ナビゲーション画面" className={styles.featureImg} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴5: 人員配置 --- */}
            <section className={`${styles.featureSection} py-20 px-6 md:px-12`}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className={`flex-1 ${styles.scrollTrigger}`}>
                        <h2 className={`${styles.featureTitle} mb-6`}>担当従業員の<br /><span className={styles.featureTitleHighlight}>登録も簡単！</span></h2>
                        <p className={`${styles.featureDesc} text-lg`}>お客様の家から近い順に<br />従業員が表示され、迷う時間が無くなります。</p>
                    </div>
                    <div className={`flex-1 w-full ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="w-full max-w-sm ml-auto mr-auto md:mr-0 transform hover:rotate-1 transition-transform duration-500">
                            <img src={shift4Img} alt="人員配置画面" className={styles.featureImg} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- コスト＆デバイス訴求セクション --- */}
            <section className={`${styles.pricingSection} py-24 px-6 md:px-12 relative overflow-hidden`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-20"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-10"></div>

                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center gap-10 md:gap-16 relative z-10">
                    <div className={`${styles.cardContainer} flex-1 p-10 text-center flex flex-col items-center ${styles.scrollTrigger}`}>
                        <div className="mb-6">
                            <ResponsiveIcon />
                        </div>
                        <h3 className={`${styles.cardTitle} mb-4`}>PCでもスマホでも</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            事務所のパソコンでじっくり管理。<br />移動中にスマホでサッと確認。<br />クラウドだからデータは常に同期されます。
                        </p>
                    </div>

                    <div className={`${styles.cardContainer} flex-1 p-10 text-center flex flex-col items-center justify-between ${styles.scrollTrigger}`} style={{ transitionDelay: '0.2s' }}>
                        <div className="mb-4">
                            <span className={styles.priceTag}>¥300</span>
                            <span className="text-gray-500 font-medium ml-1">/月</span>
                        </div>
                        <h3 className={`${styles.cardTitle} mb-4`}>分かりやすい料金体系</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            契約日に毎月、従業員1人につき300円請求いたします。<br />
                            <span className={`${styles.featureTitleHighlight} font-bold mt-2 block`}>最初の5人までは<br />無料でご利用いただけます。</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* --- フッター/CTA --- */}
            <footer className={`${styles.footerSection} pt-20 pb-12 px-6 md:px-12 text-center border-t border-gray-100`}>
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">
                    <img src={footerTitleImg} alt="さあ、始めましょう" className="max-w-[280px] md:max-w-sm mb-4" />

                    <div className="w-full flex flex-col items-center gap-8">
                        <Link to="/register" className={`${styles.footerCtaBtn} w-full max-w-sm py-4 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all`}>
                            今すぐ無料で登録する
                        </Link>

                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <Link to="/login" className={styles.footerLink}>ログイン</Link>
                            <span>|</span>
                            <GoogleLoginButton
                                buttonText="Googleでログイン"
                                variant="link"
                                className={styles.footerLink}
                            />
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-4 text-gray-400 text-sm mt-4">
                            <a href="/how_to_use" className={styles.footerLink}>使い方</a>
                            <span className="hidden sm:inline">|</span>
                            <a href="https://ryu2013.github.io/ryuuiti_memos/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>アプリ運営者</a>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-gray-400 text-xs mt-2 border-t border-gray-200 pt-8 w-full">
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>利用規約</a>
                            <span className="hidden sm:inline">|</span>
                            <a href="/privacy_policy" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>プライバシーポリシー</a>
                            <span className="hidden sm:inline">|</span>
                            <a href="/specified_commercial_transactions" className={styles.footerLink}>特定商取引法に基づく表記</a>
                        </div>

                        <p className="text-gray-400 text-xs mt-6">© 2026 CareShift All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
