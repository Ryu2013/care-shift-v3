import styles from './HowToUse.module.css';
import chat1 from '../../assets/chat1.png';
import chat2 from '../../assets/chat2.png';
import chat3 from '../../assets/chat3.png';
import chat4 from '../../assets/chat4.png';

export default function HowToUseChatPage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">チャット機能の使い方</h1>
            <p className="mb-8">このアプリケーションのチャット機能の使い方を説明します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メインページよりチャットボタンを押してください</h2>
            <img src={chat1} alt="チャットボタンを押す" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">新規ボタンを押してください</h2>
            <img src={chat2} alt="新規ボタンを押す" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">チャットを始めたい従業員を選択します</h2>
            <img src={chat3} alt="従業員を選択" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">チャット画面が表示されます</h2>
            <img src={chat4} alt="チャット画面" className={`${styles.featureImage} mb-8`} />

            <p className="mb-8">次回からは既存ページよりチャットに戻れます</p>
        </>
    );
}
