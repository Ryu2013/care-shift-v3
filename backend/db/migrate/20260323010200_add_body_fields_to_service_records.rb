class AddBodyFieldsToServiceRecords < ActiveRecord::Migration[7.2]
  def change
    change_table :service_records, bulk: true do |t|
      t.boolean :toilet_assist, default: false, null: false, comment: "トイレ介助"
      t.boolean :portable_toilet_assist, default: false, null: false, comment: "ポータブルトイレ介助"
      t.boolean :diaper_change, default: false, null: false, comment: "おむつ交換"
      t.boolean :pad_change, default: false, null: false, comment: "パッド交換"
      t.boolean :linen_change, default: false, null: false, comment: "リネン等交換"
      t.boolean :perineal_cleaning, default: false, null: false, comment: "陰部清潔介助"
      t.boolean :urinal_washing, default: false, null: false, comment: "尿器洗浄"
      t.integer :urine_count, comment: "排尿回数"
      t.integer :urine_amount, comment: "排尿量（cc）"
      t.integer :stool_count, comment: "排便回数"
      t.string :stool_status, comment: "排便状態"

      t.boolean :posture_support, default: false, null: false, comment: "姿勢の確保"
      t.boolean :meal_assist_full, default: false, null: false, comment: "食事介助（全介助）"
      t.boolean :meal_assist_partial, default: false, null: false, comment: "食事介助（一部介助）"
      t.integer :water_intake, comment: "水分補給量（cc）"
      t.boolean :meal_completed, default: false, null: false, comment: "食事完食"
      t.boolean :meal_leftover, default: false, null: false, comment: "食事残しあり"

      t.boolean :bathing_assist, default: false, null: false, comment: "入浴介助"
      t.boolean :shower_bath, default: false, null: false, comment: "シャワー浴"
      t.boolean :hair_wash, default: false, null: false, comment: "洗髪"
      t.boolean :partial_bath_hand, default: false, null: false, comment: "部分浴（手）"
      t.boolean :partial_bath_foot, default: false, null: false, comment: "部分浴（足）"
      t.boolean :full_body_cleaning, default: false, null: false, comment: "清拭（全身）"
      t.boolean :partial_cleaning, default: false, null: false, comment: "清拭（部分）"

      t.boolean :face_wash, default: false, null: false, comment: "洗面"
      t.boolean :oral_care, default: false, null: false, comment: "口腔ケア"
      t.boolean :dressing_assist, default: false, null: false, comment: "更衣介助"
      t.boolean :nail_care, default: false, null: false, comment: "整容（爪）"
      t.boolean :ear_care, default: false, null: false, comment: "整容（耳）"
      t.boolean :hair_care, default: false, null: false, comment: "整容（髪）"
      t.boolean :beard_shave, default: false, null: false, comment: "整容（髭）"
      t.boolean :makeup, default: false, null: false, comment: "整容（化粧）"

      t.boolean :position_change, default: false, null: false, comment: "体位変換"
      t.boolean :transfer_assist, default: false, null: false, comment: "移乗介助"
      t.boolean :mobility_assist, default: false, null: false, comment: "移動介助"
      t.boolean :outing_preparation, default: false, null: false, comment: "外出準備介助"
      t.boolean :outing_accompaniment, default: false, null: false, comment: "外出受入介助"
      t.boolean :commute_assist, default: false, null: false, comment: "通院介助"
      t.boolean :shopping_assist, default: false, null: false, comment: "買物介助"

      t.boolean :wake_up_assist, default: false, null: false, comment: "起床介助"
      t.boolean :bedtime_assist, default: false, null: false, comment: "就寝介助"

      t.boolean :medication_support, default: false, null: false, comment: "服薬介助・確認"
      t.boolean :medication_application, default: false, null: false, comment: "薬の塗布"
      t.boolean :suction, default: false, null: false, comment: "痰の吸引"
      t.boolean :enema, default: false, null: false, comment: "浣腸"
      t.boolean :tube_feeding, default: false, null: false, comment: "経管栄養"
      t.boolean :hospital_assist, default: false, null: false, comment: "院内介助"
      t.boolean :watch_over, default: false, null: false, comment: "見守り"

      t.boolean :cleaning_support, default: false, null: false, comment: "自立支援（掃除）"
      t.boolean :laundry_support, default: false, null: false, comment: "自立支援（洗濯）"
      t.boolean :bed_make, default: false, null: false, comment: "自立支援（ベッドメイク）"
      t.boolean :clothing_arrangement, default: false, null: false, comment: "自立支援（衣類整理）"
      t.boolean :cooking_support, default: false, null: false, comment: "自立支援（調理）"
      t.boolean :shopping_support, default: false, null: false, comment: "自立支援（買い物）"

      t.boolean :voice_toilet_meal, default: false, null: false, comment: "声掛け（排泄・食事）"
      t.boolean :voice_hygiene, default: false, null: false, comment: "声掛け（清拭・入浴・整容）"
      t.boolean :voice_hospital, default: false, null: false, comment: "声掛け（通院・外出）"
      t.boolean :voice_sleep, default: false, null: false, comment: "声掛け（起床・就寝）"
      t.boolean :voice_medication, default: false, null: false, comment: "声掛け（服薬）"
    end
  end
end
