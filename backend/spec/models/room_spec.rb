require "rails_helper"

RSpec.describe Room, type: :model do
  describe "#has_unread_messages?" do
    let(:user) { create(:user) }
    let(:other_user) { create(:user, office: user.office, team: user.team) }
    let(:room) { create(:room, office: user.office) }
    let!(:entry) { create(:entry, room: room, user: user, office: user.office, last_read_at: last_read_at) }
    let!(:other_entry) { create(:entry, room: room, user: other_user, office: user.office) }

    context "最終既読日時が nil のとき" do
      let(:last_read_at) { nil }

      it "メッセージがなければ false を返す" do
        expect(room.has_unread_messages?(user)).to be(false)
      end

      it "他ユーザーのメッセージがあれば true を返す" do
        create(:message, room: room, user: other_user, office: user.office)

        expect(room.has_unread_messages?(user)).to be(true)
      end
    end

    context "最終既読日時があるとき" do
      let(:last_read_at) { 1.hour.ago }

      it "新しいメッセージがなければ false を返す" do
        create(:message, room: room, user: other_user, office: user.office, created_at: 2.hours.ago)

        expect(room.has_unread_messages?(user)).to be(false)
      end

      it "新しいメッセージがあれば true を返す" do
        create(:message, room: room, user: other_user, office: user.office, created_at: 30.minutes.ago)

        expect(room.has_unread_messages?(user)).to be(true)
      end
    end
  end
end
