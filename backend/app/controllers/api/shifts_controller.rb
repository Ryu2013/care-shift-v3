class Api::ShiftsController < Api::AuthorizationController
  def index
    target_user_id = params[:user_id]
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current

    if target_user_id.present? && target_user_id.to_s != current_user.id.to_s
      authorize :admin, :allow?
      @user = current_user.office.users.find(target_user_id)
    else
      @user = current_user
    end

    shifts = @user.shifts.scope_month(date).includes(:client)
    render json: shifts.order(:date, :start_time).map { |s| ShiftSerializer.new(s) }
  end

  def update
    @shift = current_user.office.shifts.find(params[:id])

    if @shift.user_id != current_user.id
      authorize :admin, :allow?
    end

    if @shift.update(shift_params)
      render json: ShiftSerializer.new(@shift)
    else
      render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def shift_params
    params.require(:shift).permit(:work_status)
  end
end
