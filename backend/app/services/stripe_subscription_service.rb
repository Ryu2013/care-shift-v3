class StripeSubscriptionService
  attr_reader :office, :user

  def initialize(office, user)
    @office = office
    @user   = user
  end

  def create_checkout_session(success_url:, cancel_url:)
    create_customer unless office.stripe_customer_id.present?

    session = Stripe::Checkout::Session.create(
      customer: office.stripe_customer_id,
      mode: "subscription",
      line_items: [{ price: ENV["STRIPE_METERED_PRICE_ID"] }],
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: { office_id: office.id },
      subscription_data: { metadata: { office_id: office.id } }
    )

    session.url
  end

  def create_portal_session(return_url:)
    Stripe::BillingPortal::Session.create(
      customer: office.stripe_customer_id,
      return_url: return_url
    ).url
  end

  private

  def create_customer
    customer = Stripe::Customer.create(
      email: user.email,
      name: office.name,
      metadata: { office_id: office.id }
    )
    office.update!(stripe_customer_id: customer.id)
  end
end
