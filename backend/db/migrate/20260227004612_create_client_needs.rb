class CreateClientNeeds < ActiveRecord::Migration[7.2]
  def change
    create_table :client_needs do |t|
      t.references :client, null: false, foreign_key: true
      t.references :office, null: false, foreign_key: true
      t.integer :shift_type
      t.integer :slots
      t.time :start_time
      t.time :end_time
      t.integer :week

      t.timestamps
    end
  end
end
