require "rails_helper"

RSpec.describe "メッセージAPI", type: :request do
  let(:user) { create(:user) }
  let(:office) { user.office }
  let(:team) { user.team }
  let(:other_user) { create(:user, office: office, team: team) }
  let(:room) { create(:room, office: office) }

  before do
    create(:entry, room: room, user: user, office: office)
    create(:entry, room: room, user: other_user, office: office)
  end

  describe "GET /api/rooms/:room_id/messages" do
    it "メッセージ一覧を返し、last_read_at を更新する" do
      create(:message, room: room, user: other_user, office: office, content: "hello")
      api_sign_in(user)

      get "/api/rooms/#{room.id}/messages"

      expect(response).to have_http_status(:ok)
      expect(json.first["content"]).to eq("hello")
      expect(room.entries.find_by(user: user).reload.last_read_at).to be_present
    end

    it "参加情報がなくても一覧を返す" do
      create(:message, room: room, user: other_user, office: office, content: "hello")
      room.entries.find_by(user: user).destroy!
      api_sign_in(user)

      get "/api/rooms/#{room.id}/messages"

      expect(response).to have_http_status(:ok)
      expect(json.first["content"]).to eq("hello")
    end

    it "別事業所のルームには not_found を返す" do
      other_room = create(:room)
      api_sign_in(user)

      get "/api/rooms/#{other_room.id}/messages"

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end

  describe "POST /api/rooms/:room_id/messages" do
    it "メッセージを作成する" do
      api_sign_in(user)

      expect {
        post "/api/rooms/#{room.id}/messages", params: { message: { content: "こんにちは" } }, headers: csrf_headers, as: :json
      }.to change(Message, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["content"]).to eq("こんにちは")
    end

    it "作成時に ActionCable で配信する" do
      api_sign_in(user)
      allow(ActionCable.server).to receive(:broadcast)

      post "/api/rooms/#{room.id}/messages", params: { message: { content: "こんにちは" } }, headers: csrf_headers, as: :json

      expect(ActionCable.server).to have_received(:broadcast).with(
        "room_#{room.id}",
        hash_including(content: "こんにちは")
      )
    end

    it "空の本文では unprocessable_content を返す" do
      api_sign_in(user)

      post "/api/rooms/#{room.id}/messages", params: { message: { content: "" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end

    it "別事業所のルームには not_found を返す" do
      other_room = create(:room)
      api_sign_in(user)

      post "/api/rooms/#{other_room.id}/messages", params: { message: { content: "こんにちは" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end
end
