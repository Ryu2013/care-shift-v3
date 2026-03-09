class Api::Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  # サインアップ
  def create
    build_resource(sign_up_params)

    resource.setup_default_office_and_team! if resource.office_id.blank?

    resource.save
    yield resource if block_given?
    respond_with resource
  end

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: UserSerializer.new(resource), status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
