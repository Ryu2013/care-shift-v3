class Api::Admin::SubscriptionsController < Api::Admin::AuthorizationController
  def subscribe
    return render_stripe_disabled unless StripeSettings.enabled?

    service = StripeSubscriptionService.new(current_user.office, current_user)
    url = service.create_checkout_session(
      success_url: ENV["FRONTEND_URL"] + "/settings?success=true",
      cancel_url:  ENV["FRONTEND_URL"] + "/subscription"
    )
    render json: { url: url }
  end

  def portal
    return render_stripe_disabled unless StripeSettings.enabled?

    service = StripeSubscriptionService.new(current_user.office, current_user)
    url = service.create_portal_session(
      return_url: ENV["FRONTEND_URL"] + "/settings"
    )
    render json: { url: url }
  end

  private

  def render_stripe_disabled
    render json: { errors: [ "Stripe課金は現在無効です" ] }, status: :unprocessable_content
  end
end
