class Client < ApplicationRecord
  belongs_to :office
  belongs_to :team
  has_many :shifts, dependent: :destroy
  has_many :service_records, through: :shifts
  has_many :client_needs, dependent: :destroy
  has_many :user_clients, dependent: :destroy
  has_many :users, through: :user_clients

  accepts_nested_attributes_for :user_clients, allow_destroy: true

  validates :name, presence: true
  validate :team_must_belong_to_same_office

  geocoded_by :address, latitude: :latitude, longitude: :longitude
  after_validation :geocode, if: :address_changed?

  private

  def team_must_belong_to_same_office
    return unless office && team
    return if team.office_id == office_id

    errors.add(:team, "は同じ事業所のチームを指定してください")
  end
end
