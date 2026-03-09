import apiClient from './rails-api'
import type { Message } from '../types'

export const getMessages = (roomId: number) =>
    apiClient.get<Message[]>(`/rooms/${roomId}/messages`)

export const createMessage = (roomId: number, content: string) =>
    apiClient.post<Message>(`/rooms/${roomId}/messages`, { message: { content } })
