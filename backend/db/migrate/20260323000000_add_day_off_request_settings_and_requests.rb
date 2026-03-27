class AddDayOffRequestSettingsAndRequests < ActiveRecord::Migration[7.2]
  def change
    change_table :offices, bulk: true do |t|
      t.integer :monthly_day_off_limit, null: false, default: 3
      t.integer :request_deadline_day, null: false, default: 20
    end

    create_table :day_off_months do |t|
      t.references :office, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.date :target_month, null: false
      t.datetime :submitted_at

      t.timestamps
    end

    add_index :day_off_months, [ :office_id, :user_id, :target_month ], unique: true, name: "index_day_off_months_on_office_user_month"

    create_table :day_off_dates do |t|
      t.references :office, null: false, foreign_key: true
      t.references :day_off_month, null: false, foreign_key: true
      t.date :request_date, null: false

      t.timestamps
    end

    add_index :day_off_dates, [ :office_id, :request_date ], name: "index_day_off_dates_on_office_and_date"
    add_index :day_off_dates, [ :day_off_month_id, :request_date ], unique: true, name: "index_day_off_dates_on_month_and_date"
  end
end
