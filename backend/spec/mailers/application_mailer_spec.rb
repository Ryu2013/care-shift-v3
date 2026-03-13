require "rails_helper"

RSpec.describe ApplicationMailer, type: :mailer do
  it "デフォルトの送信元アドレスを使う" do
    expect(ApplicationMailer.default_params[:from]).to eq("from@example.com")
  end

  it "メイラーレイアウトを使う" do
    expect(ApplicationMailer._layout).to eq("mailer")
  end
end
