export type Role = 'employee' | 'admin'
export type ShiftType = 'day' | 'night' | 'escort'
export type WorkStatus = 'not_work' | 'work'

export interface User {
  id: number
  email: string
  name: string
  role: Role
  office_id: number
  team_id: number
}

export interface Office {
  id: number
  name: string
  subscription_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
}

export interface Team {
  id: number
  name: string
  office_id: number
}

export interface Client {
  id: number
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  office_id: number
  team_id: number
}

export interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  shift_type: ShiftType
  work_status: WorkStatus
  is_escort: boolean
  note: string | null
  client_id: number
  user_id: number | null
  office_id: number
}

export interface ClientNeed {
  id: number
  shift_type: ShiftType
  week: string
  start_time: string
  end_time: string
  slots: number
  client_id: number
}

export interface Room {
  id: number
  name: string
  office_id: number
}

export interface Message {
  id: number
  content: string
  user_id: number
  room_id: number
  created_at: string
}
