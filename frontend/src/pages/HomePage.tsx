import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/rails-api';
import styles from './HomePage.module.css';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const ResponsiveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                await api.get('/shifts');
                navigate('/shifts', { replace: true });
            } catch (error) {
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
            <header>
                <div>
                    <div>
                        <img src="/src/assets/logo.png" alt="ケアシフト ロゴ" />
                        <span>シフト管理アプリ</span>
                    </div>
                    <nav>
                        <Link to="/register">新規登録</Link>
                        <Link to="/login">ログイン</Link>
                    </nav>
                </div>
            </header>

            {/* --- メインビジュアル --- */}
            <section>
                <div>
                    <img src="/src/assets/title.png" alt="タイトル" />

                    <div>
                        <div>
                            <img src="/src/assets/calendar.png" alt="シフト管理" />
                            <span>シフト管理</span>
                        </div>
                        <div>
                            <img src="/src/assets/clock.png" alt="勤怠管理" />
                            <span>勤怠管理</span>
                        </div>
                        <div>
                            <img src="/src/assets/chat.png" alt="チャット" />
                            <span>チャット</span>
                        </div>
                        <div>
                            <img src="/src/assets/navi.png" alt="ナビ" />
                            <span>ナビ</span>
                        </div>
                        <div>
                            <img src="/src/assets/human.png" alt="人員配置" />
                            <span>人員配置</span>
                        </div>
                    </div>

                    <p>複雑な管理業務を。<br />PCでもスマートフォンでも簡単に。</p>

                    <div>
                        <Link to="/register">新規登録</Link>
                        <button type="button" onClick={() => alert('Not implemented')}>
                            <GoogleIcon />
                            <span>Googleで登録</span>
                        </button>
                        <p>
                            アカウントを作成することで、
                            <a href="/terms" target="_blank" rel="noopener noreferrer">利用規約</a>
                            および<br />
                            <a href="/privacy_policy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>
                            に同意したものとみなします。
                        </p>
                    </div>
                </div>
            </section>

            {/* --- 特徴1: シフト登録 --- */}
            <section>
                <div>
                    <div>
                        <h2>2クリックで<br /><span>簡単にシフト登録!</span></h2>
                        <p>担当者を選んでポチッとするだけ。<br />PCの大画面でも、スマホのタッチ操作でも<br />直感的に登録完了します。</p>
                    </div>
                    <div>
                        <div>
                            <img src="/src/assets/shifts.png" alt="シフト画面背景" />
                            <img src="/src/assets/client_need.png" alt="担当者選択ポップアップ" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴2: 勤怠管理 --- */}
            <section>
                <div>
                    <div>
                        <h2>勤怠管理も<br /><span>らくらく!</span></h2>
                        <p>出勤状況が一目瞭然。<br />管理の手間を大幅に削減します。</p>
                    </div>
                    <div>
                        <img src="/src/assets/work_statuses.png" alt="出勤状況管理" />
                    </div>
                </div>
            </section>

            {/* --- 特徴3: 業務連絡 --- */}
            <section>
                <div>
                    <div>
                        <h2>業務連絡も<br /><span>簡単！</span></h2>
                        <p>チャット機能も搭載<br />色々なアプリを行ったり来たりする必要はもうありません。</p>
                    </div>
                    <div>
                        <div>
                            <img src="/src/assets/chat_view.png" alt="チャット画面" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 特徴4: ナビゲーション --- */}
            <section>
                <div>
                    <div>
                        <h2>ワンタップで<br /><span>出勤らくらく!</span></h2>
                        <p>ボタン一つで本日担当のお宅まで<br />ナビゲーション致します。</p>
                    </div>
                    <div>
                        <img src="/src/assets/nav_view.png" alt="ナビゲーション画面" />
                    </div>
                </div>
            </section>

            {/* --- 特徴5: 人員配置 --- */}
            <section>
                <div>
                    <div>
                        <h2>担当従業員の<br /><span>登録も簡単！</span></h2>
                        <p>お客様の家から近い順に<br />従業員が表示され、迷う時間が無くなります。</p>
                    </div>
                    <div>
                        <div>
                            <img src="/src/assets/shift4.png" alt="人員配置画面" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- コスト＆デバイス訴求セクション --- */}
            <section>
                <div>
                    <div>
                        <div>
                            <ResponsiveIcon />
                        </div>
                        <h3>PCでもスマホでも</h3>
                        <p>事務所のパソコンでじっくり管理。<br />移動中にスマホでサッと確認。<br />クラウドだからデータは常に同期されます。</p>
                    </div>
                    <div>
                        <div>
                            <span>¥300</span>
                        </div>
                        <h3>分かりやすい料金体系</h3>
                        <p>契約日に毎月、従業員1人につき300円請求いたします。<br />最初の5人までは<br />無料でご利用いただけます。</p>
                    </div>
                </div>
            </section>

            {/* --- フッター/CTA --- */}
            <footer>
                <div>
                    <img src="/src/assets/footer_title.png" alt="さあ、始めましょう" />
                    <div>
                        <Link to="/register">今すぐ無料で登録する</Link>
                        <div>
                            <Link to="/login">ログイン</Link>
                            <span>|</span>
                            <button type="button" onClick={() => alert('Not implemented')}>Googleでログイン</button>
                        </div>
                        <div>
                            <a href="/how_to_use">使い方</a>
                            <span>|</span>
                            <a href="https://ryu2013.github.io/ryuuiti_memos/" target="_blank" rel="noopener noreferrer">アプリ運営者</a>
                        </div>
                        <div>
                            <a href="/terms" target="_blank" rel="noopener noreferrer">利用規約</a>
                            <span>|</span>
                            <a href="/privacy_policy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>
                            <span>|</span>
                            <a href="/specified_commercial_transactions">特定商取引法に基づく表記</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
