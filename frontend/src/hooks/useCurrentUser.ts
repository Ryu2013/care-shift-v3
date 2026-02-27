import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import type { User } from '../types'

export const useCurrentUser = () =>
  useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<User>('/me')
        return res.data
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
