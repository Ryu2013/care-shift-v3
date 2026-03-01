import apiClient from './client'
import type { Message } from '../types'

export const messageApi = {
    getMessages: (roomId: number) => apiClient.get<Message[]>(`/rooms/${roomId}/messages`).then(res => res.data),
    createMessage: (roomId: number, content: string) => apiClient.post<Message>(`/rooms/${roomId}/messages`, { message: { content } }).then(res => res.data),
}
