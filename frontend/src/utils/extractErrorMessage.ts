export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (typeof error === 'object' && error !== null) {
    const maybeResponse = (error as {
      response?: {
        data?: {
          error?: string | string[]
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

    if (Array.isArray(data?.error) && data.error.length > 0) {
      return data.error.join('\n')
    }

    if (typeof data?.error === 'string' && data.error.trim() !== '') {
      return data.error
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
