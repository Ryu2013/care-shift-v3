import axios from 'axios'

type CsrfResponse = {
  csrf_token: string
}

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

export const getCsrfToken = () => csrfToken

export const setCsrfToken = (token: string | null) => {
  csrfToken = token
}

export const ensureCsrfToken = async () => {
  if (csrfToken) return csrfToken
  if (csrfRequest) return csrfRequest

  csrfRequest = axios
    .get<CsrfResponse>('/api/csrf', {
      withCredentials: true,
      headers: { Accept: 'application/json' },
    })
    .then((response) => {
      csrfToken = response.data.csrf_token
      return csrfToken
    })
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}
