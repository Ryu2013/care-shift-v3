import apiClient from './rails-api'

export const createUserClient = (data: { client_id: number; user_id: number; note?: string }) =>
    apiClient.post('/admin/user_clients', { user_client: data })

export const deleteUserClient = (id: number) =>
    apiClient.delete(`/admin/user_clients/${id}`)
