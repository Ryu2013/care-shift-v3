class Api::Admin::ShiftsController < Api::Admin::AuthorizationController
  def index
    date = params[:date].present? ? Date.strptime(params[:date], "%Y-%m") : Date.current
    shifts = current_user.office.shifts.scope_month(date).includes(:user, :client)
    shifts = shifts.where(client_id: params[:client_id]) if params[:client_id]
    render json: shifts.order(:date, :start_time).map { |s| ShiftSerializer.new(s) }
  end

  def create
    unless current_user.office.subscription_active?
      return render json: { errors: [ "サブスクリプションが有効ではありません" ] }, status: :payment_required
    end
    shift = current_user.office.shifts.build(shift_params.except(:client_id, :user_id))
    assign_shift_relations(shift)

    if shift.save
      render json: ShiftSerializer.new(shift), status: :created
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    shift = current_user.office.shifts.find(params[:id])
    shift.assign_attributes(shift_params.except(:client_id, :user_id))
    assign_shift_relations(shift)

    if shift.save
      render json: ShiftSerializer.new(shift)
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    shift = current_user.office.shifts.find(params[:id])
    shift.destroy!
    head :no_content
  end

  def generate_monthly
    client = current_user.office.clients.find(params[:client_id])
    month  = Date.strptime(params[:date], "%Y-%m")
    result = ::MonthlyGenerator.new(client: client, month: month, office: current_user.office).call
    render json: { created: result[:created] }
  end

  private

  def assign_shift_relations(shift)
    shift.client = current_user.office.clients.find(shift_params[:client_id]) if shift_params[:client_id].present?
    shift.user = shift_params[:user_id].present? ? current_user.office.users.find(shift_params[:user_id]) : nil
  end

  def shift_params
    params.require(:shift).permit(:user_id, :client_id, :shift_type, :note, :date, :start_time, :end_time, :work_status)
  end
end
