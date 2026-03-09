import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessageProps {
    type: AlertType;
    message: any; // 文字列、または AxiosError などのオブジェクトを直接受け取る
    className?: string;
}

export default function AlertMessage({ type, message, className = '' }: AlertMessageProps) {
    if (!message) return null;

    // API エラーなどのオブジェクトから文字列を抽出する
    let displayMessage = '';

    if (typeof message === 'string') {
        displayMessage = message;
    } else if (message.response?.data) {
        // Axiosのレスポンスエラーの場合
        const data = message.response.data;
        displayMessage = data.error || data.message || JSON.stringify(data);
    } else if (message instanceof Error) {
        // 通常のJSエラーオブジェクト
        displayMessage = message.message;
    } else {
        // その他
        displayMessage = String(message);
    }

    if (!displayMessage) return null;

    const baseStyles = "mb-6 p-4 text-sm font-medium rounded animate-fade-in-up border-l-4 flex items-center";

    const typeStyles: Record<AlertType, string> = {
        success: "bg-green-50 border-green-500 text-green-700",
        error: "bg-red-50 border-red-500 text-red-700",
        warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
        info: "bg-blue-50 border-blue-500 text-blue-700"
    };

    const icons: Record<AlertType, React.ReactNode> = {
        success: (
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        )
    };

    return (
        <div className={`${baseStyles} ${typeStyles[type]} ${className}`}>
            {icons[type]}
            <span dangerouslySetInnerHTML={{ __html: displayMessage.replace(/\n/g, '<br />') }} />
        </div>
    );
}
