class Api::Employee::DayOffMonthsController < Api::AuthorizationController
  def index
    day_off_month = current_user.day_off_months.includes(:day_off_dates).find_by(target_month: target_month)

    render json: {
      office: OfficeSerializer.new(current_user.office),
      target_month: target_month,
      deadline_date: current_user.office.day_off_deadline_for(target_month),
      day_off_month: day_off_month ? DayOffMonthSerializer.new(day_off_month) : nil
    }
  end

  def create
    day_off_month = current_user.day_off_months.find_or_initialize_by(target_month: target_month)
    created = day_off_month.new_record?
    day_off_month.save_day_off_month!(request_dates: day_off_month_params[:request_dates])

    render json: DayOffMonthSerializer.new(day_off_month.reload), status: created ? :created : :ok
  rescue ArgumentError
    render json: { errors: [ "target_month は YYYY-MM 形式で指定してください" ] }, status: :unprocessable_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.record.errors.full_messages.presence || e.message ].flatten }, status: :unprocessable_content
  rescue DayOffMonth::SubmissionError => e
    render json: { errors: [ e.message ] }, status: :unprocessable_content
  end

  private

  def target_month
    Date.strptime(params.fetch(:target_month), "%Y-%m").beginning_of_month
  rescue KeyError, ArgumentError
    raise ArgumentError
  end

  def day_off_month_params
    params.require(:day_off_month).permit(request_dates: [])
  end
end
