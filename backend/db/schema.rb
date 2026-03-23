# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_23_010100) do
  create_table "client_needs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.bigint "office_id", null: false
    t.integer "shift_type"
    t.integer "slots"
    t.time "start_time"
    t.time "end_time"
    t.integer "week"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_client_needs_on_client_id"
    t.index ["office_id"], name: "index_client_needs_on_office_id"
  end

  create_table "clients", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "address"
    t.float "latitude"
    t.float "longitude"
    t.bigint "office_id", null: false
    t.bigint "team_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_clients_on_office_id"
    t.index ["team_id"], name: "index_clients_on_team_id"
  end

  create_table "day_off_dates", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "office_id", null: false
    t.bigint "day_off_month_id", null: false
    t.date "request_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["day_off_month_id", "request_date"], name: "index_day_off_dates_on_month_and_date", unique: true
    t.index ["day_off_month_id"], name: "index_day_off_dates_on_day_off_month_id"
    t.index ["office_id", "request_date"], name: "index_day_off_dates_on_office_and_date"
    t.index ["office_id"], name: "index_day_off_dates_on_office_id"
  end

  create_table "day_off_months", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "office_id", null: false
    t.bigint "user_id", null: false
    t.date "target_month", null: false
    t.datetime "submitted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id", "user_id", "target_month"], name: "index_day_off_months_on_office_user_month", unique: true
    t.index ["office_id"], name: "index_day_off_months_on_office_id"
    t.index ["user_id"], name: "index_day_off_months_on_user_id"
  end

  create_table "entries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_id", null: false
    t.bigint "office_id", null: false
    t.datetime "last_read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_entries_on_office_id"
    t.index ["room_id", "user_id"], name: "index_entries_on_room_id_and_user_id", unique: true
    t.index ["room_id"], name: "index_entries_on_room_id"
    t.index ["user_id"], name: "index_entries_on_user_id"
  end

  create_table "messages", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_id", null: false
    t.bigint "office_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_messages_on_office_id"
    t.index ["room_id"], name: "index_messages_on_room_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "offices", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.string "subscription_status"
    t.datetime "current_period_end"
    t.boolean "cancel_at_period_end"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "monthly_day_off_limit", default: 3, null: false
    t.integer "request_deadline_day", default: 20, null: false
  end

  create_table "rooms", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.bigint "office_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_rooms_on_office_id"
  end

  create_table "service_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "shift_id", null: false, comment: "対象シフト"
    t.bigint "service_type_id", null: false, comment: "サービス種別"
    t.boolean "is_first_visit", default: false, null: false, comment: "特定加算（初回）"
    t.boolean "is_emergency", default: false, null: false, comment: "特定加算（緊急）"
    t.boolean "schedule_changed", default: false, null: false, comment: "予定変更の有無"
    t.integer "appearance_status", default: 0, null: false, comment: "顔色（0:良, 1:不良）"
    t.boolean "has_sweating", default: false, null: false, comment: "発汗の有無"
    t.decimal "body_temperature", precision: 4, scale: 1, comment: "体温（℃）"
    t.integer "systolic_bp", comment: "血圧（収縮期 / 上）"
    t.integer "diastolic_bp", comment: "血圧（拡張期 / 下）"
    t.boolean "environment_preparation", default: false, null: false, comment: "環境整備"
    t.boolean "consultation_support", default: false, null: false, comment: "相談援助"
    t.boolean "information_collection_and_provision", default: false, null: false, comment: "情報収集・提供"
    t.boolean "record_checked", default: false, null: false, comment: "記録実施"
    t.text "note", comment: "特記事項・備考"
    t.datetime "submitted_at", comment: "提出日時"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_type_id"], name: "index_service_records_on_service_type_id"
    t.index ["shift_id"], name: "index_service_records_on_shift_id", unique: true
  end

  create_table "service_types", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "office_id", null: false, comment: "事業所"
    t.string "name", null: false, comment: "サービス種別名"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_service_types_on_office_id"
  end

  create_table "shifts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.bigint "office_id", null: false
    t.bigint "user_id"
    t.date "date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.integer "shift_type"
    t.integer "work_status", default: 0
    t.boolean "is_escort", default: false
    t.string "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_shifts_on_client_id"
    t.index ["office_id"], name: "index_shifts_on_office_id"
    t.index ["user_id"], name: "index_shifts_on_user_id"
  end

  create_table "teams", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.bigint "office_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["office_id"], name: "index_teams_on_office_id"
  end

  create_table "user_clients", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "client_id", null: false
    t.bigint "office_id", null: false
    t.string "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id", "user_id"], name: "index_user_clients_on_client_id_and_user_id", unique: true
    t.index ["client_id"], name: "index_user_clients_on_client_id"
    t.index ["office_id"], name: "index_user_clients_on_office_id"
    t.index ["user_id"], name: "index_user_clients_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "otp_secret"
    t.boolean "otp_required_for_login"
    t.integer "consumed_timestep"
    t.integer "second_factor_attempts_count"
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.bigint "invited_by_id"
    t.integer "invitations_count", default: 0
    t.string "name", null: false
    t.integer "role", default: 0, null: false
    t.bigint "office_id", null: false
    t.bigint "team_id", null: false
    t.string "address"
    t.float "latitude"
    t.float "longitude"
    t.string "provider"
    t.string "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_users_on_invited_by"
    t.index ["office_id"], name: "index_users_on_office_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["team_id"], name: "index_users_on_team_id"
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "client_needs", "clients"
  add_foreign_key "client_needs", "offices"
  add_foreign_key "clients", "offices"
  add_foreign_key "clients", "teams"
  add_foreign_key "day_off_dates", "day_off_months"
  add_foreign_key "day_off_dates", "offices"
  add_foreign_key "day_off_months", "offices"
  add_foreign_key "day_off_months", "users"
  add_foreign_key "entries", "offices"
  add_foreign_key "entries", "rooms"
  add_foreign_key "entries", "users"
  add_foreign_key "messages", "offices"
  add_foreign_key "messages", "rooms"
  add_foreign_key "messages", "users"
  add_foreign_key "rooms", "offices"
  add_foreign_key "service_records", "service_types"
  add_foreign_key "service_records", "shifts"
  add_foreign_key "service_types", "offices"
  add_foreign_key "shifts", "clients"
  add_foreign_key "shifts", "offices"
  add_foreign_key "shifts", "users"
  add_foreign_key "teams", "offices"
  add_foreign_key "user_clients", "clients"
  add_foreign_key "user_clients", "offices"
  add_foreign_key "user_clients", "users"
  add_foreign_key "users", "offices"
  add_foreign_key "users", "teams"
end
