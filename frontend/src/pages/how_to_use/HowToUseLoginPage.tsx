import styles from './HowToUse.module.css';
import login1 from '../../assets/login1.png';
import registration6 from '../../assets/registration6.png';
import login3 from '../../assets/login3.png';
import registration7 from '../../assets/registration7.png';

export default function HowToUseLoginPage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">ログイン方法</h1>
            <p className="mb-4">このアプリケーションのログイン方法を説明します。</p>
            <p className="mb-8">登録方法は以下の2通りがあります。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">Googleアカウントでログイン</h2>
            <img src={login1} alt="Googleアカウントでログイン" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">Googleアカウントで登録ボタンした方は下記の「Googleでログインを押してください」</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">Googleアカウントの選択</h2>
            <img src={registration6} alt="Googleアカウントの選択" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">使用するGoogleアカウントを選択します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">ログイン完了です</h2>
            <img src={login3} alt="ログイン完了" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メールアドレスでのアカウントログイン</h2>
            <img src={registration7} alt="メールアドレスでのアカウントログイン" className={`${styles.featureImage} mb-4`} />
            <p className="mb-4">ログインページで必要な情報を入力します。</p>
            <p className="mb-8">二段階認証を設定している場合は、確認コードも入力してください。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">ログイン完了です</h2>
            <img src={login3} alt="ログイン完了" className={`${styles.featureImage} mb-4`} />
        </>
    );
}
