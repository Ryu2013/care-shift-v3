class Office < ApplicationRecord
  validates :name, presence: true
  validates :monthly_day_off_limit, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 } #整数かつ0以上
  validates :request_deadline_day, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 31 } #整数かつ1以上31以下

  has_many :users, dependent: :destroy
  has_many :shifts, dependent: :destroy
  has_many :clients, dependent: :destroy
  has_many :teams, dependent: :destroy
  has_many :user_clients, dependent: :destroy
  has_many :client_needs, dependent: :destroy
  has_many :service_types, dependent: :destroy
  has_many :day_off_months, dependent: :destroy
  has_many :day_off_dates, dependent: :destroy
  has_many :rooms, dependent: :destroy
  has_many :entries, through: :rooms
  has_many :messages, through: :rooms
  has_many :service_records, through: :shifts

  def day_off_deadline_for(target_month)
    month = target_month.beginning_of_month
    day = [ request_deadline_day, month.end_of_month.day ].min #存在しない日付を防ぐ

    Date.new(month.year, month.month, day)
  end

  def subscription_active?
    return true if users.count <= 4
    return true if [ "active", "trialing", "past_due", "unpaid" ].include?(subscription_status)
    false
  end
end
