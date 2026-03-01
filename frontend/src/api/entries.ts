import apiClient from './client'

export const entryApi = {
    createEntry: (roomId: number, userId: number) =>
        apiClient.post(`/rooms/${roomId}/entries`, { user_id: userId }),
    deleteEntry: (roomId: number, entryId: number) =>
        apiClient.delete(`/rooms/${roomId}/entries/${entryId}`),
}
