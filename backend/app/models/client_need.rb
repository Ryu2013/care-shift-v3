class ClientNeed < ApplicationRecord
  belongs_to :office
  belongs_to :client

  before_validation :set_office_id, if: -> { client.present? }

  validates :shift_type, :week, :start_time, :end_time, :slots, presence: true
  validate :duration_limit

  enum :shift_type, { day: 0, night: 1 }
  enum :week, { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

  private

  def set_office_id
    self.office_id = client.office_id
  end

  def duration_limit
    return unless start_time && end_time
    diff_seconds = end_time <= start_time ? (end_time + 1.day) - start_time : end_time - start_time
    errors.add(:base, "24時間を超える場合、次の日と分割してください") if diff_seconds >= 23.hours + 59.minutes
  end
end
