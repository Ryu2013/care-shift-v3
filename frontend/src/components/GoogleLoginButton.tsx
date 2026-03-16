import { useState, useEffect } from 'react'
import { ensureCsrfToken, getCsrfToken } from '../api/csrf'

interface GoogleLoginButtonProps {
    buttonText?: string
    variant?: 'button' | 'link'
    className?: string
}

export default function GoogleLoginButton({
    buttonText = 'Googleでログイン',
    variant = 'button',
    className = ''
}: GoogleLoginButtonProps) {
    const [csrfLoading, setCsrfLoading] = useState(true)

    useEffect(() => {
        // Initialize CSRF token
        const fetchCsrf = async () => {
            try {
                await ensureCsrfToken()
            } catch (e) {
                console.error('Failed to initialize CSRF token', e)
            } finally {
                setCsrfLoading(false)
            }
        }
        fetchCsrf()
    }, [])

    const handleGoogleSignIn = (e: React.MouseEvent) => {
        e.preventDefault()
        const csrfToken = getCsrfToken()

        const form = document.createElement('form')
        form.method = 'POST'
        form.action = '/api/users/auth/google_oauth2'

        if (csrfToken) {
            const csrfInput = document.createElement('input')
            csrfInput.type = 'hidden'
            csrfInput.name = 'authenticity_token'
            csrfInput.value = csrfToken
            form.appendChild(csrfInput)
        }

        document.body.appendChild(form)
        form.submit()
    }

    if (variant === 'link') {
        return (
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={csrfLoading}
                className={`text-gray-400 text-sm hover:text-[#5daaf5] cursor-pointer disabled:opacity-50 border-none bg-transparent p-0 m-0 ${className}`}
            >
                {buttonText}
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={csrfLoading}
            className={`w-full flex items-center justify-center gap-3 bg-white text-[#3c4043] border border-[#dadce0] font-medium py-3 px-4 rounded-full transition-all duration-200 hover:bg-[#f8faff] hover:shadow-sm cursor-pointer disabled:opacity-50 ${className}`}
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{buttonText}</span>
        </button>
    )
}
