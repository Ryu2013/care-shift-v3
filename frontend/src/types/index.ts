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
  address: string | null
}

export interface Office {
  id: number
  name: string
  monthly_day_off_limit: number
  request_deadline_day: number
  subscription_active?: boolean
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
  user_clients?: { id: number; user_id: number; user_name: string }[]
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
  client?: { name: string; address?: string | null; latitude?: number | null; longitude?: number | null }
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
  users?: User[]
  has_unread?: boolean
  latest_message?: Message
}

export interface Message {
  id: number
  content: string
  user_id: number
  room_id: number
  created_at: string
  user?: User
}

export interface DayOffMonth {
  id: number
  office_id: number
  user_id: number
  target_month: string
  submitted_at: string | null
  request_dates: string[]
  user?: {
    id: number
    name: string
    team_id: number
    team_name: string
  } | null
}

export interface EmployeeDayOffMonthResponse {
  office: Office
  target_month: string
  deadline_date: string
  day_off_month: DayOffMonth | null
}
