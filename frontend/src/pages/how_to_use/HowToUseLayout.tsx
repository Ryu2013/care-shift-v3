import { NavLink, Outlet, Link } from 'react-router-dom';
import styles from './HowToUse.module.css';
import { HamburgerMenuButton } from '../../components/HamburgerMenuButton';
import logoImg from '../../assets/logo.png';

const navItems = [
    { path: '/', label: 'ホーム' },
    { path: '/how-to-use', label: '使い方トップ' },
    { path: '/how-to-use/registration', label: '登録方法' },
    { path: '/how-to-use/login', label: 'ログイン方法' },
    { path: '/how-to-use/shift-creation', label: 'シフト作成' },
    { path: '/how-to-use/attendance', label: '勤怠管理' },
    { path: '/how-to-use/chat', label: 'チャット機能' },
];

export default function HowToUseLayout() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ナビゲーションヘッダー */}
            <nav className={`relative z-50 py-3 mb-5 border-b border-gray-200 bg-white ${styles.howToUseNav} flex items-center justify-between px-5 md:px-12`}>
                {/* ロゴとホームへのリンク */}
                <Link to="/" className="flex items-center gap-3 decoration-none">
                    <img src={logoImg} alt="ケアシフト ロゴ" className="h-8" />
                </Link>

                {/* モバイル用ハンバーガーメニュー（ドロワー内蔵） */}
                <HamburgerMenuButton className="md:hidden flex justify-end" buttonClassName="ml-auto">
                    <div className="flex flex-col items-center gap-6 pt-20 pb-10 overflow-y-auto h-full px-4 w-screen right-0 absolute bg-white">
                        <div className="text-xl font-bold mb-4 text-[#3A8EBA]">ケアシフト 使い方</div>
                        {navItems.map((item) => (
                            <NavLink
                                key={`mobile-${item.path}`}
                                to={item.path}
                                end={item.path === '/how-to-use'}
                                className={({ isActive }) =>
                                    `text-lg font-bold w-full text-center py-3 rounded-xl transition-all duration-200 decoration-none ${isActive ? 'bg-[var(--blue-color)] text-white shadow-md' : 'text-gray-700 bg-gray-50'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </HamburgerMenuButton>

                {/* PC用ナビゲーションリンク */}
                <ul className="hidden md:flex flex-row justify-center items-center m-0 p-0 list-none flex-1 -ml-32">
                    {navItems.map((item) => (
                        <li key={`desktop-${item.path}`} className="mx-2 w-auto text-center relative z-10">
                            <NavLink
                                to={item.path}
                                end={item.path === '/how-to-use'}
                                className={({ isActive }) =>
                                    `inline-block w-auto px-3 py-2 rounded-md transition-colors duration-200 decoration-none font-medium ${isActive ? styles.navLinkActive : styles.navLink
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* メインコンテンツエリア */}
            <div className="max-w-3xl mx-auto px-4 md:px-5 pb-10 font-sans tracking-wide leading-relaxed text-gray-800">
                <Outlet />
            </div>
        </div>
    );
}
