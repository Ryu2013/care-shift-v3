import styles from './HowToUse.module.css';
import shift1 from '../../assets/shift1.png';
import shift2 from '../../assets/shift2.png';
import shift3 from '../../assets/shift3.png';
import shift4 from '../../assets/shift4.png';
import shift5 from '../../assets/shift5.png';
import shift6 from '../../assets/shift6.png';
import shift7 from '../../assets/shift7.png';
import shift8 from '../../assets/shift8.png';
import shift9 from '../../assets/shift9.png';

export default function HowToUseShiftCreationPage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">シフト作成方法</h1>
            <p className="mb-8">このアプリケーションのシフト作成方法を説明します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メインページから顧客を選択しシフト作成ボタンを押してください。</h2>
            <img src={shift1} alt="メインページから顧客を選択" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">毎週のシフトを登録しておきます</h2>
            <img src={shift2} alt="毎週のシフトを登録" className={`${styles.featureImage} mb-4`} />
            <img src={shift3} alt="毎週のシフトを登録詳細" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">次に担当可能な従業員を選択しておきます</h2>
            <img src={shift4} alt="担当可能な従業員を選択" className={`${styles.featureImage} mb-4`} />
            <p className="mb-8">お客様、従業員が住所を登録している場合は家が近い順に表示されます</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メインページに戻りシフト新規作成ボタンを押します</h2>
            <img src={shift5} alt="メインページに戻りシフト新規作成ボタンを押す" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">次に一か月分のシフトを生成ボタンを押してください</h2>
            <img src={shift6} alt="一か月分のシフトを生成" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">シフトが完成しました</h2>
            <img src={shift7} alt="シフト完成" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">またシフト新規作成ページより一日分のシフトも作成できます</h2>
            <p className="mb-8">急遽、同行などが入った場合等にご活用ください</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">生成されたシフトをクイックし担当者を選択してください</h2>
            <img src={shift8} alt="担当者を選択" className={`${styles.featureImage} mb-4`} />
            <img src={shift9} alt="担当者を確定" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">これでシフト登録が完成しました</h2>
            <p className="mb-8">登録されたシフトは従業員へ自動で共有されます</p>
        </>
    );
}
