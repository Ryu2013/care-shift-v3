class Api::Employee::ShiftsController < Api::AuthorizationController
  before_action :set_user

  def index
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current
    today = Date.today

    shifts = @user.shifts.scope_month(date).includes(:client).order(:date, :start_time)
    today_shifts = @user.shifts.where(date: today).order(:start_time).includes(:client)

    monthly_shifts = @user.shifts.scope_month(date)
    total_hours = monthly_shifts.sum(&:duration).round(2)
    worked_hours = monthly_shifts.work.sum(&:duration).round(2)

    render json: {
      shifts: shifts.group_by { |s| s.date.to_s },
      today_shifts: today_shifts,
      total_hours: total_hours,
      worked_hours: worked_hours,
      date: date.strftime("%Y-%m")
    }
  end

  def update
    shift = @user.shifts.find(params[:id])
    if shift.update(shift_params)
      render json: shift
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    if current_user.admin? && params[:user_id].present?
      @user = current_user.office.users.find(params[:user_id])
    else
      @user = current_user
    end
  end

  def shift_params
    params.require(:shift).permit(:work_status)
  end
end
