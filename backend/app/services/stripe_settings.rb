class StripeSettings
  def self.enabled?
    Rails.application.credentials.dig(:stripe, :enabled).to_s == "true"
  end
end
