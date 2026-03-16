export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (typeof error === 'object' && error !== null) {
    const responseData = (error as {
      response?: {
        data?: {
          errors?: string[]
        }
      }
      message?: string
    }).response?.data

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors.join('\n')
    }

    const message = (error as { message?: string }).message
    if (typeof message === 'string' && message.trim() !== '') {
      return message
    }
  }

  return fallback
}
