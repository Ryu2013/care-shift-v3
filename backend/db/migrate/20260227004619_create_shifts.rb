class CreateShifts < ActiveRecord::Migration[7.2]
  def change
    create_table :shifts do |t|
      t.references :client, null: false, foreign_key: true
      t.references :office, null: false, foreign_key: true
      t.references :user, foreign_key: true
      t.date    :date,       null: false
      t.time    :start_time, null: false
      t.time    :end_time,   null: false
      t.integer :shift_type
      t.integer :work_status,  default: 0
      t.boolean :is_escort,    default: false
      t.string  :note

      t.timestamps
    end
  end
end
