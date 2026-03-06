import apiClient from './rails-api'

export const subscribe = () => {
    return apiClient.post('/admin/subscription/subscribe')
}

export const createPortalSession = () => {
    return apiClient.post('/admin/subscription/portal')
}
