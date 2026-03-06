import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { HamburgerMenuButton } from './HamburgerMenuButton';
import { signOut } from '../api/auth';
import logoImg from '../assets/logo.png';

interface HeaderProps {
    title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleSignOut = async () => {
        try {
            await signOut();
            queryClient.removeQueries({ queryKey: ['currentUser'] });
            queryClient.clear();
            navigate('/login');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-[var(--white-color)] backdrop-blur-[90px] border-b border-[rgba(105,197,255,0.2)]">
            <Link to="/shifts" className="flex items-center no-underline gap-3">
                <img src={logoImg} alt="ケアシフト ロゴ" className="h-10 w-auto" />
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-[var(--blue-color)] leading-none">CareShift</span>
                    <span className="text-[10px] text-[var(--black-color)] font-medium">シフト管理アプリ</span>
                </div>
            </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/shifts" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">シフト表</Link>
          <Link to="/rooms" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">チャット</Link>
          <Link to="/settings" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">部署/会社</Link>
          <Link to="/clients" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">利用者とスタッフ</Link>
          <Link to="/work-statuses" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">出退勤状況</Link>
          <Link to="/two-factor-setup" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">二段階認証</Link>
          <button onClick={handleSignOut} className="font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer">ログアウト</button>
        </nav>

            {/* ハンバーガーボタン (モバイル用 - md以上で非表示) */}
            <HamburgerMenuButton className="md:hidden">
                <nav className="flex flex-col items-center gap-8 pt-20">
                    <Link to="/shifts" className="font-bold text-xl text-[#333]">シフト表</Link>
                    <Link to="/rooms" className="font-bold text-xl text-[#333]">チャット</Link>
                    <Link to="/settings" className="font-bold text-xl text-[#333]">部署/会社</Link>
                    <Link to="/clients" className="font-bold text-xl text-[#333]">利用者とスタッフ</Link>
                    <Link to="/work-statuses" className="font-bold text-xl text-[#333]">出退勤状況</Link>
                    <Link to="/two-factor-setup" className="font-bold text-xl text-[#333]">二段階認証</Link>
                    <button onClick={handleSignOut} className="font-bold text-xl text-red-500 mt-2">ログアウト</button>
                </nav>
            </HamburgerMenuButton>
        </header>
    );
};
