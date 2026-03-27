class DayOffMonthSerializer
  def initialize(day_off_month)
    @day_off_month = day_off_month
  end

  def as_json(*)
    {
      id: @day_off_month.id,
      office_id: @day_off_month.office_id,
      user_id: @day_off_month.user_id,
      target_month: @day_off_month.target_month,
      submitted_at: @day_off_month.submitted_at,
      request_dates: @day_off_month.day_off_dates.order(:request_date).map(&:request_date),
      user: @day_off_month.user ? {
        id: @day_off_month.user.id,
        name: @day_off_month.user.name,
        team_id: @day_off_month.user.team_id,
        team_name: @day_off_month.user.team&.name
      } : nil
    }
  end
end
