// apiレスポンスのエラー値を抽出する。fallbackは初期値を渡す。

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (typeof error === 'object' && error !== null) {
    const maybeResponse = (error as {
      response?: {
        data?: {
          errors?: string[]
          message?: string
        }
      }
      message?: string
    }).response

    const data = maybeResponse?.data
    
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join('\n')
    }

    if (typeof data?.message === 'string' && data.message.trim() !== '') {
      return data.message
    }

    if (typeof (error as { message?: string }).message === 'string' && (error as { message?: string }).message?.trim() !== '') {
      return (error as { message: string }).message
    }
  }

  return fallback
}
