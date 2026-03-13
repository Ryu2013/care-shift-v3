require "rails_helper"

RSpec.describe RoomChannel do
  let(:office) { create(:office) }
  let(:user) { create(:user, office: office, team: create(:team, office: office)) }
  let(:channel) { described_class.allocate }

  before do
    current_user = user
    channel.define_singleton_method(:current_user) { current_user }
  end

  describe "#subscribed" do
    let(:relation) { instance_double(ActiveRecord::Relation) }

    before do
      allow(user.office).to receive(:rooms).and_return(relation)
      subscribed_room_id = room_id
      channel.define_singleton_method(:params) { { room_id: subscribed_room_id } }
    end

    context "when the user belongs to the room" do
      let(:room) { create(:room, office: office) }
      let(:room_id) { room.id }

      before do
        create(:entry, office: office, room: room, user: user)
        allow(relation).to receive(:find_by).with(id: room.id).and_return(room)
      end

      it "starts streaming from the room channel" do
        expect(channel).to receive(:stream_from).with("room_#{room.id}")

        channel.subscribed
      end
    end

    context "when the room is missing or the user is not a participant" do
      let(:room_id) { 999_999 }

      before do
        allow(relation).to receive(:find_by).with(id: room_id).and_return(nil)
      end

      it "rejects the subscription" do
        expect(channel).to receive(:reject)

        channel.subscribed
      end
    end
  end

  describe "#unsubscribed" do
    it "does not raise an error" do
      expect { channel.unsubscribed }.not_to raise_error
    end
  end
end
