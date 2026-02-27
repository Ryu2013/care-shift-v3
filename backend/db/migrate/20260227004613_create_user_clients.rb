class CreateUserClients < ActiveRecord::Migration[7.2]
  def change
    create_table :user_clients do |t|
      t.references :user,   null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.references :office, null: false, foreign_key: true
      t.string :note

      t.timestamps
    end

    add_index :user_clients, [:client_id, :user_id], unique: true
  end
end
