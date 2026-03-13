require "rails_helper"

RSpec.describe ApplicationCable::Connection do
  describe "#connect" do
    let(:user) { build_stubbed(:user) }
    let(:logger) { double("logger", add_tags: true) }
    let(:connection) { described_class.allocate }

    before do
      allow(connection).to receive(:env).and_return({ "warden" => double(user: user) })
      allow(connection).to receive(:logger).and_return(logger)
    end

    it "sets current_user and adds log tags" do
      expect(logger).to receive(:add_tags).with("ActionCable", user.email)

      connection.connect

      expect(connection.current_user).to eq(user)
    end
  end

  describe "#find_verified_user" do
    let(:connection) { described_class.allocate }

    before do
      allow(connection).to receive(:env).and_return({ "warden" => double(user: nil) })
    end

    it "rejects unauthorized connections when no user is present" do
      expect(connection).to receive(:reject_unauthorized_connection)

      connection.send(:find_verified_user)
    end
  end
end
