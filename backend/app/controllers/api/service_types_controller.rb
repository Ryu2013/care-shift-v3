class Api::ServiceTypesController < Api::AuthorizationController
  def index
    service_types = current_user.office.service_types.order(:id)
    render json: service_types.map { |service_type| ServiceTypeSerializer.new(service_type) }
  end
end
