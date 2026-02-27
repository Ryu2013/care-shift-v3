class Api::ShiftsController < Api::BaseController
  before_action :set_shift, only: %i[update destroy]

  def index
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current
    shifts = current_user.office.shifts.scope_month(date).includes(:user, :client)
    shifts = shifts.where(client_id: params[:client_id]) if params[:client_id]
    render json: shifts.order(:date, :start_time)
  end

  def create
    unless current_user.office.subscription_active?
      return render json: { error: "サブスクリプションが有効ではありません" }, status: :payment_required
    end
    shift = current_user.office.shifts.build(shift_params)
    if shift.save
      render json: shift, status: :created
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @shift.update(shift_params)
      render json: @shift
    else
      render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @shift.destroy!
    head :no_content
  end

  def generate_monthly
    client = current_user.office.clients.find(params[:client_id])
    month  = Date.strptime(params[:date], "%Y-%m")
    result = ::Shifts::MonthlyGenerator.new(client: client, month: month, office: current_user.office).call
    render json: { created: result[:created] }
  end

  private

  def set_shift
    @shift = current_user.office.shifts.find(params[:id])
  end

  def shift_params
    params.require(:shift).permit(:user_id, :client_id, :shift_type, :note, :date, :start_time, :end_time, :work_status)
  end
end
