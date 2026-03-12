class Api::Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  # POST /api/users/password
  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      render json: { message: "パスワード再設定用のメールを送信しました" }, status: :ok
    else
      render json: { error: resource.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PUT /api/users/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      if Devise.sign_in_after_reset_password
        flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
        set_flash_message!(:notice, flash_message)
        resource.after_database_authentication
        sign_in(resource_name, resource)
        render json: { message: "パスワードが正常に変更され、ログインしました" }, status: :ok
      else
        set_flash_message!(:notice, :updated_not_active)
        render json: { message: "パスワードが正常に変更されました" }, status: :ok
      end
    else
      render json: { error: resource.errors.full_messages }, status: :unprocessable_content
    end
  end
end
