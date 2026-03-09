class Api::Admin::AuthorizationController < Api::AuthorizationController
  before_action :authorize_admin!

  private

  def authorize_admin!
    authorize :admin, :allow?
  end
end
