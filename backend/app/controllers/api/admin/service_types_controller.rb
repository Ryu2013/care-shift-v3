class Api::Admin::ServiceTypesController < Api::Admin::AuthorizationController
  before_action :set_service_type, only: %i[update destroy]

  def index
    service_types = current_user.office.service_types.order(:id)
    render json: service_types.map { |service_type| ServiceTypeSerializer.new(service_type) }
  end

  def create
    service_type = current_user.office.service_types.build(service_type_params)

    if service_type.save
      render json: ServiceTypeSerializer.new(service_type), status: :created
    else
      render json: { errors: service_type.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @service_type.update(service_type_params)
      render json: ServiceTypeSerializer.new(@service_type)
    else
      render json: { errors: @service_type.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @service_type.destroy
      head :no_content
    else
      render json: { errors: @service_type.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_service_type
    @service_type = current_user.office.service_types.find(params[:id])
  end

  def service_type_params
    params.require(:service_type).permit(:name)
  end
end
