Geocoder.configure(
  lookup: :google,
  use_https: true,
  api_key: Rails.application.credentials.dig(:google, :maps_api_key),
  units: :km
)

# テスト環境ではGoogleに通信せず、偽のデータを返す設定
if Rails.env.test?
  Geocoder.configure(lookup: :test, ip_lookup: :test)

  Geocoder::Lookup::Test.set_default_stub(
    [
      {
        "coordinates"  => [ 35.6895, 139.6917 ],
        "address"      => "Tokyo, Japan",
        "state"        => "Tokyo",
        "country"      => "Japan",
        "country_code" => "JP"
      }
    ]
  )
end
