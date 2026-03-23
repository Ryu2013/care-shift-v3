class DayOffMonth < ApplicationRecord
  SubmissionError = Class.new(StandardError)

  belongs_to :office
  belongs_to :user
  has_many :day_off_dates, dependent: :destroy

  before_validation :normalize_target_month
  before_validation :set_office_id

  validates :target_month, presence: true
  validates :user_id, uniqueness: { scope: [ :office_id, :target_month ] }

  scope :for_month, ->(target_month) { where(target_month: target_month.beginning_of_month) }
  scope :for_team, ->(team_id) { joins(:user).where(users: { team_id: team_id }) }

  def save_day_off_month!(request_dates:)
    set_office_id
    normalized_dates = normalize_request_dates!(request_dates)

    validate_deadline!
    validate_request_dates_limit!(normalized_dates)

    self.submitted_at = Time.current

    transaction do
      save!
      day_off_dates.destroy_all
      normalized_dates.each do |request_date|
        day_off_dates.create!(office: office, request_date: request_date)
      end
    end
  end

  private

  def normalize_target_month
    self.target_month = target_month.beginning_of_month if target_month.present?
  end

  def set_office_id
    self.office_id = user.office_id if user.present?
  end

  def normalize_request_dates!(request_dates)
    dates = Array(request_dates) #配列に変換
      .map { |request_date| Date.parse(request_date.to_s) } #Dateが文字列を期待する為to_s
      .sort
      .uniq

    raise SubmissionError, "希望休は対象月の日付だけ指定できます" if dates.any? { |date| date.beginning_of_month != target_month }

    dates
  rescue Date::Error
    raise SubmissionError, "希望休の日付形式が不正です"
  end

  def validate_deadline! #提出期限を過ぎてないか
    return unless Date.current > office.day_off_deadline_for(target_month)

    raise SubmissionError, "提出期限を過ぎているため更新できません"
  end

  def validate_request_dates_limit!(request_dates) #希望上限を超えてないか
    return unless request_dates.size > office.monthly_day_off_limit

    raise SubmissionError, "希望休は月#{office.monthly_day_off_limit}日までです"
  end
end
