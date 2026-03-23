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

ActiveRecord::Schema[7.2].define(version: 2026_03_23_010500) do
  create_table "active_storage_attachments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

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
    t.boolean "toilet_assist", default: false, null: false, comment: "トイレ介助"
    t.boolean "portable_toilet_assist", default: false, null: false, comment: "ポータブルトイレ介助"
    t.boolean "diaper_change", default: false, null: false, comment: "おむつ交換"
    t.boolean "pad_change", default: false, null: false, comment: "パッド交換"
    t.boolean "linen_change", default: false, null: false, comment: "リネン等交換"
    t.boolean "perineal_cleaning", default: false, null: false, comment: "陰部清潔介助"
    t.boolean "urinal_washing", default: false, null: false, comment: "尿器洗浄"
    t.integer "urine_count", comment: "排尿回数"
    t.integer "urine_amount", comment: "排尿量（cc）"
    t.integer "stool_count", comment: "排便回数"
    t.string "stool_status", comment: "排便状態"
    t.boolean "posture_support", default: false, null: false, comment: "姿勢の確保"
    t.boolean "meal_assist_full", default: false, null: false, comment: "食事介助（全介助）"
    t.boolean "meal_assist_partial", default: false, null: false, comment: "食事介助（一部介助）"
    t.integer "water_intake", comment: "水分補給量（cc）"
    t.boolean "meal_completed", default: false, null: false, comment: "食事完食"
    t.boolean "meal_leftover", default: false, null: false, comment: "食事残しあり"
    t.boolean "bathing_assist", default: false, null: false, comment: "入浴介助"
    t.boolean "shower_bath", default: false, null: false, comment: "シャワー浴"
    t.boolean "hair_wash", default: false, null: false, comment: "洗髪"
    t.boolean "partial_bath_hand", default: false, null: false, comment: "部分浴（手）"
    t.boolean "partial_bath_foot", default: false, null: false, comment: "部分浴（足）"
    t.boolean "full_body_cleaning", default: false, null: false, comment: "清拭（全身）"
    t.boolean "partial_cleaning", default: false, null: false, comment: "清拭（部分）"
    t.boolean "face_wash", default: false, null: false, comment: "洗面"
    t.boolean "oral_care", default: false, null: false, comment: "口腔ケア"
    t.boolean "dressing_assist", default: false, null: false, comment: "更衣介助"
    t.boolean "nail_care", default: false, null: false, comment: "整容（爪）"
    t.boolean "ear_care", default: false, null: false, comment: "整容（耳）"
    t.boolean "hair_care", default: false, null: false, comment: "整容（髪）"
    t.boolean "beard_shave", default: false, null: false, comment: "整容（髭）"
    t.boolean "makeup", default: false, null: false, comment: "整容（化粧）"
    t.boolean "position_change", default: false, null: false, comment: "体位変換"
    t.boolean "transfer_assist", default: false, null: false, comment: "移乗介助"
    t.boolean "mobility_assist", default: false, null: false, comment: "移動介助"
    t.boolean "outing_preparation", default: false, null: false, comment: "外出準備介助"
    t.boolean "outing_accompaniment", default: false, null: false, comment: "外出受入介助"
    t.boolean "commute_assist", default: false, null: false, comment: "通院介助"
    t.boolean "shopping_assist", default: false, null: false, comment: "買物介助"
    t.boolean "wake_up_assist", default: false, null: false, comment: "起床介助"
    t.boolean "bedtime_assist", default: false, null: false, comment: "就寝介助"
    t.boolean "medication_support", default: false, null: false, comment: "服薬介助・確認"
    t.boolean "medication_application", default: false, null: false, comment: "薬の塗布"
    t.boolean "suction", default: false, null: false, comment: "痰の吸引"
    t.boolean "enema", default: false, null: false, comment: "浣腸"
    t.boolean "tube_feeding", default: false, null: false, comment: "経管栄養"
    t.boolean "hospital_assist", default: false, null: false, comment: "院内介助"
    t.boolean "watch_over", default: false, null: false, comment: "見守り"
    t.boolean "independence_cleaning_support", default: false, null: false, comment: "自立支援（掃除）"
    t.boolean "independence_laundry_support", default: false, null: false, comment: "自立支援（洗濯）"
    t.boolean "independence_bed_make_support", default: false, null: false, comment: "自立支援（ベッドメイク）"
    t.boolean "independence_clothing_arrangement_support", default: false, null: false, comment: "自立支援（衣類整理）"
    t.boolean "independence_cooking_support", default: false, null: false, comment: "自立支援（調理）"
    t.boolean "independence_shopping_support", default: false, null: false, comment: "自立支援（買い物）"
    t.boolean "voice_toilet_meal", default: false, null: false, comment: "声掛け（排泄・食事）"
    t.boolean "voice_hygiene", default: false, null: false, comment: "声掛け（清拭・入浴・整容）"
    t.boolean "voice_hospital", default: false, null: false, comment: "声掛け（通院・外出）"
    t.boolean "voice_sleep", default: false, null: false, comment: "声掛け（起床・就寝）"
    t.boolean "voice_medication", default: false, null: false, comment: "声掛け（服薬）"
    t.boolean "cleaning_room", default: false, null: false, comment: "清掃（居室）"
    t.boolean "cleaning_toilet", default: false, null: false, comment: "清掃（トイレ）"
    t.boolean "cleaning_portable_toilet", default: false, null: false, comment: "清掃（ポータブルトイレ）"
    t.boolean "cleaning_table", default: false, null: false, comment: "清掃（卓上）"
    t.boolean "cleaning_kitchen", default: false, null: false, comment: "清掃（台所）"
    t.boolean "cleaning_bathroom", default: false, null: false, comment: "清掃（浴室）"
    t.boolean "cleaning_entrance", default: false, null: false, comment: "清掃（玄関）"
    t.boolean "garbage_disposal", default: false, null: false, comment: "ゴミ出し"
    t.boolean "laundry_wash", default: false, null: false, comment: "洗濯（洗う）"
    t.boolean "laundry_dry", default: false, null: false, comment: "洗濯（乾燥・物干し）"
    t.boolean "laundry_store", default: false, null: false, comment: "洗濯（取入れ・収納）"
    t.boolean "laundry_iron", default: false, null: false, comment: "洗濯（アイロン）"
    t.boolean "bed_make", default: false, null: false, comment: "ベッドメイク"
    t.boolean "sheet_change", default: false, null: false, comment: "シーツ・カバー交換"
    t.boolean "futon_dry", default: false, null: false, comment: "布団干し"
    t.boolean "clothing_arrangement", default: false, null: false, comment: "衣類の整理"
    t.boolean "clothing_repair", default: false, null: false, comment: "被服の補修"
    t.boolean "cooking", default: false, null: false, comment: "調理"
    t.boolean "cooking_preparation", default: false, null: false, comment: "下拵え"
    t.boolean "meal_serving", default: false, null: false, comment: "配膳・下膳"
    t.text "menu_note", comment: "献立・調理内容"
    t.boolean "shopping_daily_goods", default: false, null: false, comment: "日用品等の買物"
    t.boolean "medicine_pickup", default: false, null: false, comment: "薬の受取り"
    t.integer "money_advance", comment: "預り金額（円）"
    t.integer "money_spent", comment: "購入金額（円）"
    t.integer "money_change", comment: "お釣り（円）"
    t.text "shopping_detail", comment: "内訳"
    t.text "special_note", comment: "特記事項"
    t.text "instruction_note", comment: "指示"
    t.text "report_note", comment: "報告"
    t.string "image_file", comment: "添付画像ファイル"
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
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
