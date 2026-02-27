class CreateEntries < ActiveRecord::Migration[7.2]
  def change
    create_table :entries do |t|
      t.references :user,  null: false, foreign_key: true
      t.references :room,  null: false, foreign_key: true
      t.references :office, null: false, foreign_key: true
      t.datetime :last_read_at

      t.timestamps
    end

    add_index :entries, [:room_id, :user_id], unique: true
  end
end
