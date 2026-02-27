class Client < ApplicationRecord
  belongs_to :office
  belongs_to :team
  has_many :shifts, dependent: :destroy
  has_many :client_needs, dependent: :destroy
  has_many :user_clients, dependent: :destroy
  has_many :users, through: :user_clients

  accepts_nested_attributes_for :user_clients, allow_destroy: true

  validates :name, presence: true

  geocoded_by :address, latitude: :latitude, longitude: :longitude
  after_validation :geocode, if: :address_changed?
end
