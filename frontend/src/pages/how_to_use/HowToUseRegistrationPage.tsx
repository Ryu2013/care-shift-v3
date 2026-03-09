import styles from './HowToUse.module.css';
import registration1 from '../../assets/registration1.png';
import registration2 from '../../assets/registration2.png';
import registration3 from '../../assets/registration3.png';
import registration4 from '../../assets/registration4.png';
import registration5 from '../../assets/registration5.png';
import registration6 from '../../assets/registration6.png';
import registration7 from '../../assets/registration7.png';

export default function HowToUseRegistrationPage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">登録方法</h1>
            <p className="mb-4">このアプリケーションの登録方法を説明します。</p>
            <p className="mb-8">登録方法は以下の2通りがあります。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">Googleアカウントでの登録</h2>
            <img src={registration1} alt="Googleアカウントでの登録" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">Googleアカウントで登録ボタンを押します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">Googleアカウントの選択</h2>
            <img src={registration2} alt="Googleアカウントの選択" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">使用するGoogleアカウントを選択します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">お客様を一人登録します</h2>
            <img src={registration3} alt="お客様を一人登録します" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">戻るボタンを押します</h2>
            <img src={registration4} alt="戻るボタンを押します" className={`${styles.featureImage} mb-4`} />
            <p className="mb-12">登録が完了です。</p>


            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メールアドレスでのアカウント登録</h2>
            <p className="mb-4">新規登録ボタンを押してください。</p>
            <img src={registration5} alt="メールアドレスでのアカウント登録" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">登録ページで必要な情報を入力し登録するボタンを押してください。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メールアドレス確認</h2>
            <img src={registration6} alt="メールアドレス確認" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">届いたメールにあるURLを踏んでください。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">ログイン画面よりご登録頂いたメールアドレスとパスワードでログインします</h2>
            <img src={registration7} alt="ログイン" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">顧客を一人登録します</h2>
            <img src={registration3} alt="顧客登録" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">戻るボタンを押します</h2>
            <img src={registration4} alt="戻る" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">登録が完了です。</p>
        </>
    );
}
