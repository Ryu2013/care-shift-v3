import apiClient from './rails-api'
import type { Room } from '../types'

export const getRooms = () =>
    apiClient.get<Room[]>('/rooms')

export const getRoom = (id: number) =>
    apiClient.get<Room>(`/rooms/${id}`)

export const createRoom = (data: { name: string }) =>
    apiClient.post<Room>('/rooms', { room: data })
