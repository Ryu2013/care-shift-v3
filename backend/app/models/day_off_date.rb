class DayOffDate < ApplicationRecord
  belongs_to :office
  belongs_to :day_off_month

  before_validation :set_office_id

  validates :request_date, presence: true
  validates :request_date, uniqueness: { scope: :day_off_month_id }
  validate :request_date_in_target_month

  private

  def set_office_id
    self.office_id = day_off_month.office_id if day_off_month.present?
  end

  def request_date_in_target_month
    return if request_date.blank? || day_off_month.blank? || day_off_month.target_month.blank?

    target_range = day_off_month.target_month.beginning_of_month..day_off_month.target_month.end_of_month
    return if target_range.cover?(request_date)

    errors.add(:request_date, "は申請対象月の範囲内で指定してください")
  end
end
