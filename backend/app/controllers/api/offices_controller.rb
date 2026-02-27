class Api::OfficesController < Api::BaseController
  def show
    render json: current_user.office
  end

  def update
    if current_user.office.update(office_params)
      render json: current_user.office
    else
      render json: { errors: current_user.office.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def office_params
    params.require(:office).permit(:name)
  end
end
