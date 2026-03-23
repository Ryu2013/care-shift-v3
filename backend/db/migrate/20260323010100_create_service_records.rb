class CreateServiceRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :service_records do |t|
      t.references :shift, null: false, foreign_key: true, index: { unique: true }, comment: "対象シフト"
      t.references :service_type, null: false, foreign_key: true, comment: "サービス種別"

      t.boolean :is_first_visit, null: false, default: false, comment: "特定加算（初回）"
      t.boolean :is_emergency, null: false, default: false, comment: "特定加算（緊急）"
      t.boolean :schedule_changed, null: false, default: false, comment: "予定変更の有無"

      t.integer :appearance_status, null: false, default: 0, comment: "顔色（0:良, 1:不良）"
      t.boolean :has_sweating, null: false, default: false, comment: "発汗の有無"

      t.decimal :body_temperature, precision: 4, scale: 1, comment: "体温（℃）"
      t.integer :systolic_bp, comment: "血圧（収縮期 / 上）"
      t.integer :diastolic_bp, comment: "血圧（拡張期 / 下）"

      t.boolean :environment_preparation, null: false, default: false, comment: "環境整備"
      t.boolean :consultation_support, null: false, default: false, comment: "相談援助"
      t.boolean :information_collection_and_provision, null: false, default: false, comment: "情報収集・提供"
      t.boolean :record_checked, null: false, default: false, comment: "記録実施"

      t.text :note, comment: "特記事項・備考"
      t.datetime :submitted_at, comment: "提出日時"

      t.timestamps
    end
  end
end
