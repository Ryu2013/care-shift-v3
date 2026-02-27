# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Confirmable
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email

      ## Lockable
      t.integer  :failed_attempts, default: 0, null: false
      t.string   :unlock_token
      t.datetime :locked_at

      ## Two Factor (devise-two-factor)
      t.string  :otp_secret
      t.boolean :otp_required_for_login
      t.integer :consumed_timestep
      t.integer :second_factor_attempts_count

      ## Invitable (devise_invitable)
      t.string   :invitation_token
      t.datetime :invitation_created_at
      t.datetime :invitation_sent_at
      t.datetime :invitation_accepted_at
      t.integer  :invitation_limit
      t.references :invited_by, polymorphic: true
      t.integer  :invitations_count, default: 0

      ## Profile
      t.string  :name,    null: false
      t.integer :role,    null: false, default: 0
      t.references :office, null: false, foreign_key: true
      t.references :team,   null: false, foreign_key: true
      t.string  :address
      t.float   :latitude
      t.float   :longitude

      ## OmniAuth
      t.string :provider
      t.string :uid

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
    add_index :users, :unlock_token,         unique: true
    add_index :users, :invitation_token,     unique: true
    add_index :users, :invited_by_id
  end
end
