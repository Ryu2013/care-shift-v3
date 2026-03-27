require "rails_helper"

RSpec.describe StripeSubscriptionService, type: :service do
  let(:user) { create(:user) }
  let(:office) { user.office }
  let(:service) { StripeSubscriptionService.new(office, user) }
  let(:success_url) { "https://example.com/success" }
  let(:cancel_url) { "https://example.com/cancel" }
  let(:price_id) { "price_test_123" }
  let(:session_url) { "https://checkout.stripe.com/test-session" }
  let(:session_double) { instance_double(Stripe::Checkout::Session, url: session_url) }

  before do
    allow(Rails.application.credentials).to receive(:dig).and_call_original
    allow(Rails.application.credentials).to receive(:dig)
      .with(:stripe, :enabled)
      .and_return("true")
    allow(Rails.application.credentials).to receive(:dig)
      .with(:stripe, :metered_price_id)
      .and_return(price_id)
    allow(Stripe::Checkout::Session).to receive(:create).and_return(session_double)
  end

  describe "#create_checkout_session" do
    it "Stripe が無効ならエラーにする" do
      allow(Rails.application.credentials).to receive(:dig).with(:stripe, :enabled).and_return("false")

      expect {
        service.create_checkout_session(success_url: success_url, cancel_url: cancel_url)
      }.to raise_error(Stripe::InvalidRequestError)
    end

    context "Stripe 顧客IDが設定済みの場合" do
      let(:office) { create(:office, stripe_customer_id: "cus_existing") }
      let(:user) { create(:user, office: office, team: create(:team, office: office)) }

      it "既存の顧客を使ってチェックアウトURLを返す" do
        expect(Stripe::Customer).not_to receive(:create)

        result = service.create_checkout_session(success_url: success_url, cancel_url: cancel_url)

        expect(result).to eq(session_url)
        expect(Stripe::Checkout::Session).to have_received(:create).with(
          customer: "cus_existing",
          mode: "subscription",
          line_items: [ { price: price_id } ],
          success_url: success_url,
          cancel_url: cancel_url,
          metadata: { office_id: office.id },
          subscription_data: { metadata: { office_id: office.id } }
        )
      end
    end

    context "Stripe 顧客IDが未設定の場合" do
      let(:office) { create(:office, stripe_customer_id: nil, name: "サブスク用オフィス") }
      let(:user) { create(:user, office: office, team: create(:team, office: office), email: "owner@example.com") }
      let(:stripe_customer) { instance_double(Stripe::Customer, id: "cus_new") }

      before do
        allow(Stripe::Customer).to receive(:create).and_return(stripe_customer)
      end

      it "Stripe 顧客を作成して保存し、チェックアウトセッションも作成する" do
        result = service.create_checkout_session(success_url: success_url, cancel_url: cancel_url)

        expect(result).to eq(session_url)
        expect(Stripe::Customer).to have_received(:create).with(
          email: user.email,
          name: office.name,
          metadata: { office_id: office.id }
        )
        expect(office.reload.stripe_customer_id).to eq("cus_new")
        expect(Stripe::Checkout::Session).to have_received(:create).with(
          hash_including(
            customer: "cus_new",
            mode: "subscription",
            line_items: [ { price: price_id } ],
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: { office_id: office.id },
            subscription_data: { metadata: { office_id: office.id } }
          )
        )
      end
    end
  end
end
