class ServiceRecord < ApplicationRecord
  belongs_to :shift
  belongs_to :service_type

  validates :shift_id, uniqueness: true
  validate :service_type_must_belong_to_shift_office

  enum :appearance_status, { good: 0, poor: 1 }

  private

  def service_type_must_belong_to_shift_office
    return unless shift && service_type
    return if shift.office_id == service_type.office_id

    errors.add(:service_type, "は対象シフトと同じ事業所のサービス種別を選択してください")
  end
end
