class Api::StripeWebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    payload    = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
    secret     = Rails.application.credentials.dig(:stripe, :webhook_secret) || ENV["STRIPE_WEBHOOK_SECRET"]

    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, secret)
    rescue JSON::ParserError, Stripe::SignatureVerificationError
      return head :bad_request
    end

    Rails.logger.info "Stripe webhook received: #{event.type}"

    begin
      case event.type
      when "checkout.session.completed"
        handle_checkout_session_completed(event.data.object)
      when "invoice.payment_succeeded"
        handle_payment_succeeded(event.data.object)
      when "invoice.payment_failed"
        handle_payment_failed(event.data.object)
      when "customer.subscription.updated", "customer.subscription.deleted"
        handle_subscription_updated(event.data.object)
      end
    rescue => e
      Rails.logger.error "Stripe webhook error: #{e.message}"
      return head :internal_server_error
    end

    head :ok
  end

  private

  def handle_checkout_session_completed(session)
    office = Office.find_by(id: session.metadata.office_id)
    return unless office

    stripe_sub = Stripe::Subscription.retrieve(session.subscription)
    update_office_subscription(office, stripe_sub)
    office.update!(
      stripe_customer_id:     session.customer,
      stripe_subscription_id: stripe_sub.id
    )
  end

  def handle_payment_succeeded(invoice)
    subscription_id = invoice.lines.data.first.parent.subscription_item_details.subscription
    office = Office.find_by(stripe_subscription_id: subscription_id)
    return unless office

    stripe_sub = Stripe::Subscription.retrieve(subscription_id)
    update_office_subscription(office, stripe_sub)
  end

  def handle_payment_failed(invoice)
    subscription_id = invoice.lines.data.first.parent.subscription_item_details.subscription
    office = Office.find_by(stripe_subscription_id: subscription_id)
    return unless office

    stripe_sub = Stripe::Subscription.retrieve(subscription_id)
    office.update!(subscription_status: stripe_sub.status)
  end

  def handle_subscription_updated(stripe_sub)
    office = Office.find_by(stripe_subscription_id: stripe_sub.id)
    return unless office
    update_office_subscription(office, stripe_sub)
  end

  def update_office_subscription(office, stripe_sub)
    period_end   = stripe_sub.items.data[0].current_period_end
    is_canceling = stripe_sub.cancel_at_period_end || stripe_sub.cancel_at.present?

    office.update!(
      subscription_status:  stripe_sub.status,
      current_period_end:   Time.at(period_end),
      cancel_at_period_end: is_canceling
    )
  end
end
