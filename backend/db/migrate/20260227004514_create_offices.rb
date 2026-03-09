class CreateOffices < ActiveRecord::Migration[7.2]
  def change
    create_table :offices do |t|
      t.string :name
      t.string :stripe_customer_id
      t.string :stripe_subscription_id
      t.string :subscription_status
      t.datetime :current_period_end
      t.boolean :cancel_at_period_end

      t.timestamps
    end
  end
end
