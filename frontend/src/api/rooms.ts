import apiClient from './client'
import type { Room } from '../types'

export const roomApi = {
    getRooms: () => apiClient.get<Room[]>('/rooms').then(res => res.data),
    getRoom: (id: number) => apiClient.get<Room>(`/rooms/${id}`).then(res => res.data),
    createRoom: (data: { name: string }) => apiClient.post<Room>('/rooms', { room: data }).then(res => res.data),
}
