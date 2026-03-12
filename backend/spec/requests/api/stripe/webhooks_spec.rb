require "rails_helper"

RSpec.describe "Stripe Webhook API", type: :request do
  let(:payload) { { id: "evt_test", object: "event" }.to_json }
  let(:headers) { { "HTTP_STRIPE_SIGNATURE" => "test_signature" } }

  def build_event(type:, object:)
    instance_double(Stripe::Event, type: type, data: instance_double(Stripe::Event::Data, object: object))
  end

  def stub_construct_event(event)
    allow(Rails.application.credentials).to receive(:dig).with(:stripe, :webhook_secret).and_return("whsec_test")
    allow(Stripe::Webhook).to receive(:construct_event).and_return(event)
  end

  def stub_subscription(id:, status:, period_end:, cancel_at_period_end: false, cancel_at: nil)
    instance_double(
      Stripe::Subscription,
      id: id,
      status: status,
      cancel_at_period_end: cancel_at_period_end,
      cancel_at: cancel_at,
      items: instance_double("StripeItems", data: [ instance_double("StripeItem", current_period_end: period_end) ])
    ).tap do |subscription|
      allow(Stripe::Subscription).to receive(:retrieve).with(id).and_return(subscription)
    end
  end

  def stub_invoice_with_lines(subscription_id)
    details = instance_double("SubscriptionItemDetails", subscription: subscription_id)
    parent = instance_double("InvoiceLineParent", subscription_item_details: details)
    line = instance_double("InvoiceLine", parent: parent)
    instance_double("StripeInvoice", lines: instance_double("InvoiceLines", data: [ line ]))
  end

  it "`checkout.session.completed` で事業所の状態を更新する" do
    office = create(:office)
    period_end = 2.hours.from_now.to_i
    stripe_sub = stub_subscription(id: "sub_123", status: "active", period_end: period_end, cancel_at_period_end: true)
    session = instance_double("StripeCheckoutSession", metadata: instance_double("Metadata", office_id: office.id), subscription: stripe_sub.id, customer: "cus_test123")
    stub_construct_event(build_event(type: "checkout.session.completed", object: session))

    post "/api/stripe/webhook", params: payload, headers: headers

    expect(response).to have_http_status(:ok)
    office.reload
    expect(office.stripe_customer_id).to eq("cus_test123")
    expect(office.stripe_subscription_id).to eq("sub_123")
    expect(office.subscription_status).to eq("active")
    expect(office.cancel_at_period_end).to be(true)
  end

  it "`invoice.payment_succeeded` で契約期間を更新する" do
    office = create(:office, stripe_subscription_id: "sub_renew")
    period_end = 1.day.from_now.to_i
    stub_subscription(id: "sub_renew", status: "active", period_end: period_end)
    stub_construct_event(build_event(type: "invoice.payment_succeeded", object: stub_invoice_with_lines("sub_renew")))

    post "/api/stripe/webhook", params: payload, headers: headers

    expect(response).to have_http_status(:ok)
    expect(office.reload.subscription_status).to eq("active")
  end

  it "署名検証に失敗したら bad_request を返す" do
    allow(Stripe::Webhook).to receive(:construct_event).and_raise(Stripe::SignatureVerificationError.new("bad sig", "sig"))

    post "/api/stripe/webhook", params: payload, headers: headers

    expect(response).to have_http_status(:bad_request)
  end
end
