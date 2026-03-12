module RequestHelpers
  def json
    JSON.parse(response.body)
  end

  def csrf_headers
    get "/api/csrf"
    {
      "X-CSRF-Token" => cookies["XSRF-TOKEN"],
      "ACCEPT" => "application/json"
    }
  end

  def api_sign_in(user, password: "password123", otp_attempt: nil)
    post "/api/users/sign_in",
      params: { user: { email: user.email, password: password, otp_attempt: otp_attempt } },
      headers: csrf_headers,
      as: :json
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end
