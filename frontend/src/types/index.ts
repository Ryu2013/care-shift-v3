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
  stripe_enabled: boolean
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

export interface ServiceType {
  id: number
  office_id: number
  name: string
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

export type AppearanceStatus = 'good' | 'poor'

export interface ServiceRecordShiftSummary {
  id: number
  office_id: number
  client_id: number
  user_id: number | null
  date: string
  start_time: string
  end_time: string
  client: { id: number; name: string; team_id: number } | null
  user: { id: number; name: string } | null
}

export interface ServiceRecord {
  id: number
  shift_id: number
  service_type_id: number
  is_first_visit: boolean
  is_emergency: boolean
  schedule_changed: boolean
  appearance_status: AppearanceStatus
  has_sweating: boolean
  body_temperature: number | null
  systolic_bp: number | null
  diastolic_bp: number | null
  toilet_assist: boolean
  portable_toilet_assist: boolean
  diaper_change: boolean
  pad_change: boolean
  linen_change: boolean
  perineal_cleaning: boolean
  urinal_washing: boolean
  urine_count: number | null
  urine_amount: number | null
  stool_count: number | null
  stool_status: string | null
  posture_support: boolean
  meal_assist_full: boolean
  meal_assist_partial: boolean
  water_intake: number | null
  meal_completed: boolean
  meal_leftover: boolean
  bathing_assist: boolean
  shower_bath: boolean
  hair_wash: boolean
  partial_bath_hand: boolean
  partial_bath_foot: boolean
  full_body_cleaning: boolean
  partial_cleaning: boolean
  face_wash: boolean
  oral_care: boolean
  dressing_assist: boolean
  nail_care: boolean
  ear_care: boolean
  hair_care: boolean
  beard_shave: boolean
  makeup: boolean
  position_change: boolean
  transfer_assist: boolean
  mobility_assist: boolean
  outing_preparation: boolean
  outing_accompaniment: boolean
  commute_assist: boolean
  shopping_assist: boolean
  wake_up_assist: boolean
  bedtime_assist: boolean
  medication_support: boolean
  medication_application: boolean
  suction: boolean
  enema: boolean
  tube_feeding: boolean
  hospital_assist: boolean
  watch_over: boolean
  independence_cleaning_support: boolean
  independence_laundry_support: boolean
  independence_bed_make_support: boolean
  independence_clothing_arrangement_support: boolean
  independence_cooking_support: boolean
  independence_shopping_support: boolean
  voice_toilet_meal: boolean
  voice_hygiene: boolean
  voice_hospital: boolean
  voice_sleep: boolean
  voice_medication: boolean
  cleaning_room: boolean
  cleaning_toilet: boolean
  cleaning_portable_toilet: boolean
  cleaning_table: boolean
  cleaning_kitchen: boolean
  cleaning_bathroom: boolean
  cleaning_entrance: boolean
  garbage_disposal: boolean
  laundry_wash: boolean
  laundry_dry: boolean
  laundry_store: boolean
  laundry_iron: boolean
  bed_make: boolean
  sheet_change: boolean
  futon_dry: boolean
  clothing_arrangement: boolean
  clothing_repair: boolean
  cooking: boolean
  cooking_preparation: boolean
  meal_serving: boolean
  menu_note: string | null
  shopping_daily_goods: boolean
  medicine_pickup: boolean
  money_advance: number | null
  money_spent: number | null
  money_change: number | null
  shopping_detail: string | null
  environment_preparation: boolean
  consultation_support: boolean
  information_collection_and_provision: boolean
  record_checked: boolean
  note: string | null
  special_note: string | null
  instruction_note: string | null
  report_note: string | null
  image_file: string | null
  image_url: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  service_type: ServiceType
  shift: ServiceRecordShiftSummary
}

export interface ServiceRecordInput {
  shift_id?: number
  service_type_id: number
  is_first_visit: boolean
  is_emergency: boolean
  schedule_changed: boolean
  appearance_status: AppearanceStatus
  has_sweating: boolean
  body_temperature: number | null
  systolic_bp: number | null
  diastolic_bp: number | null
  toilet_assist: boolean
  portable_toilet_assist: boolean
  diaper_change: boolean
  pad_change: boolean
  linen_change: boolean
  perineal_cleaning: boolean
  urinal_washing: boolean
  urine_count: number | null
  urine_amount: number | null
  stool_count: number | null
  stool_status: string | null
  posture_support: boolean
  meal_assist_full: boolean
  meal_assist_partial: boolean
  water_intake: number | null
  meal_completed: boolean
  meal_leftover: boolean
  bathing_assist: boolean
  shower_bath: boolean
  hair_wash: boolean
  partial_bath_hand: boolean
  partial_bath_foot: boolean
  full_body_cleaning: boolean
  partial_cleaning: boolean
  face_wash: boolean
  oral_care: boolean
  dressing_assist: boolean
  nail_care: boolean
  ear_care: boolean
  hair_care: boolean
  beard_shave: boolean
  makeup: boolean
  position_change: boolean
  transfer_assist: boolean
  mobility_assist: boolean
  outing_preparation: boolean
  outing_accompaniment: boolean
  commute_assist: boolean
  shopping_assist: boolean
  wake_up_assist: boolean
  bedtime_assist: boolean
  medication_support: boolean
  medication_application: boolean
  suction: boolean
  enema: boolean
  tube_feeding: boolean
  hospital_assist: boolean
  watch_over: boolean
  independence_cleaning_support: boolean
  independence_laundry_support: boolean
  independence_bed_make_support: boolean
  independence_clothing_arrangement_support: boolean
  independence_cooking_support: boolean
  independence_shopping_support: boolean
  voice_toilet_meal: boolean
  voice_hygiene: boolean
  voice_hospital: boolean
  voice_sleep: boolean
  voice_medication: boolean
  cleaning_room: boolean
  cleaning_toilet: boolean
  cleaning_portable_toilet: boolean
  cleaning_table: boolean
  cleaning_kitchen: boolean
  cleaning_bathroom: boolean
  cleaning_entrance: boolean
  garbage_disposal: boolean
  laundry_wash: boolean
  laundry_dry: boolean
  laundry_store: boolean
  laundry_iron: boolean
  bed_make: boolean
  sheet_change: boolean
  futon_dry: boolean
  clothing_arrangement: boolean
  clothing_repair: boolean
  cooking: boolean
  cooking_preparation: boolean
  meal_serving: boolean
  menu_note: string | null
  shopping_daily_goods: boolean
  medicine_pickup: boolean
  money_advance: number | null
  money_spent: number | null
  money_change: number | null
  shopping_detail: string | null
  environment_preparation: boolean
  consultation_support: boolean
  information_collection_and_provision: boolean
  record_checked: boolean
  note: string | null
  special_note: string | null
  instruction_note: string | null
  report_note: string | null
  image_file: string | null
  image?: File | null
  submitted_at: string | null
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
