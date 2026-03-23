class Api::Admin::OfficesController < Api::Admin::AuthorizationController
  def show
    render json: OfficeSerializer.new(current_user.office)
  end

  def update
    if current_user.office.update(office_params)
      render json: OfficeSerializer.new(current_user.office)
    else
      render json: { errors: current_user.office.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def office_params
    params.require(:office).permit(:name, :monthly_day_off_limit, :request_deadline_day)
  end
end
