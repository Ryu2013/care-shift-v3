import styles from './HowToUse.module.css';
import attendance1 from '../../assets/attendance1.png';
import attendance2 from '../../assets/attendance2.png';
import attendance3 from '../../assets/attendance3.png';

export default function HowToUseAttendancePage() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">勤怠管理方法</h1>
            <p className="mb-8">このアプリケーションの勤怠管理方法を説明します。</p>

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">メインページより出勤状況ボタンを押してください</h2>
            <img src={attendance1} alt="出勤状況ボタンを押す" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">デフォルトは当日ですが上の表から日付を選択できます</h2>
            <img src={attendance2} alt="日付を選択" className={`${styles.featureImage} mb-8`} />

            <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-300 pb-2">従業員側は当日にならないと出勤ボタンを押すことは出来ません</h2>
            <img src={attendance3} alt="出勤ボタン" className={`${styles.featureImage} mb-8`} />

            <p className="mb-4">また従業員側は当日になるとグーグルマップボタンが表示され</p>
            <p className="mb-8">現在地から勤務先までのルートを確認できます</p>
        </>
    );
}
