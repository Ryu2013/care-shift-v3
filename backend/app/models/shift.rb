class Shift < ApplicationRecord
  belongs_to :office
  belongs_to :client
  belongs_to :user, optional: true

  validates :start_time, :end_time, :date, presence: true
  validate :user_unique_per_date, if: -> { user_id.present? && date.present? }
  validate :duration_limit

  enum :shift_type, { day: 0, night: 1, escort: 2 }
  enum :work_status, { not_work: 0, work: 1 }

  scope :scope_month, ->(month) { where(date: month.beginning_of_month..month.end_of_month) }

  def duration
    return 0 unless start_time && end_time
    if end_time < start_time
      ((end_time + 1.day) - start_time) / 3600.0
    else
      (end_time - start_time) / 3600.0
    end
  end

  private

  def duration_limit
    return unless start_time && end_time
    diff_seconds = end_time <= start_time ? (end_time + 1.day) - start_time : end_time - start_time
    errors.add(:base, "24時間を超える場合、次の日と分割してください") if diff_seconds >= 23.hours + 59.minutes
  end

  def user_unique_per_date
    conflict = Shift.where(user_id: user_id, date: date)
                    .where.not(id: id)
                    .where("start_time < ? AND end_time > ?", end_time, start_time)
                    .first
    return unless conflict
    date_str = date.strftime("%Y年%m月%d日")
    start_str = start_time.strftime("%H:%M")
    end_str = end_time.strftime("%H:%M")
    c_start_str = conflict.start_time.strftime("%H:%M")
    c_end_str = conflict.end_time.strftime("%H:%M")

    errors.add(
      :base,
      "#{user&.name}さんの#{date_str}のシフト（#{start_str}〜#{end_str}）は、既に登録されているシフト（#{conflict.client&.name} #{c_start_str}〜#{c_end_str}）と時間が重複しています"
    )
  end
end
