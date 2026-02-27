class Api::SubscriptionsController < Api::BaseController
  def subscribe
    service = StripeSubscriptionService.new(current_user.office, current_user)
    url = service.create_checkout_session(
      success_url: ENV["FRONTEND_URL"] + "/subscription/checkout",
      cancel_url:  ENV["FRONTEND_URL"] + "/subscription"
    )
    render json: { url: url }
  end

  def portal
    service = StripeSubscriptionService.new(current_user.office, current_user)
    url = service.create_portal_session(
      return_url: ENV["FRONTEND_URL"] + "/settings"
    )
    render json: { url: url }
  end
end
