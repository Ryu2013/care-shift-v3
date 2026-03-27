class ServiceType < ApplicationRecord
  belongs_to :office
  has_many :service_records, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :office_id }
end
