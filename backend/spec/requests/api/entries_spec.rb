require "rails_helper"

RSpec.describe "参加者API", type: :request do
  let(:user) { create(:user, email: "entries-user-#{SecureRandom.hex(4)}@example.com") }
  let(:office) { user.office }
  let(:team) { user.team }
  let(:other_user) { create(:user, office: office, team: team, email: "entries-other-#{SecureRandom.hex(4)}@example.com") }
  let(:room) { create(:room, office: office) }

  describe "POST /api/rooms/:room_id/entries" do
    it "ルーム参加者のエントリーを作成する" do
      api_sign_in(user)

      expect {
        post "/api/rooms/#{room.id}/entries", params: { user_id: other_user.id }, headers: csrf_headers, as: :json
      }.to change(Entry, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["user_id"]).to eq(other_user.id)
    end

    it "重複ユーザーでは unprocessable_content を返す" do
      create(:entry, room: room, user: other_user, office: office)
      api_sign_in(user)

      post "/api/rooms/#{room.id}/entries", params: { user_id: other_user.id }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end

    it "別事業所のルームには not_found を返す" do
      other_room = create(:room)
      api_sign_in(user)

      post "/api/rooms/#{other_room.id}/entries", params: { user_id: other_user.id }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end

  describe "DELETE /api/entries/:id" do
    it "参加者のエントリーを削除する" do
      entry = create(:entry, room: room, user: other_user, office: office)
      api_sign_in(user)

      expect {
        delete "/api/entries/#{entry.id}", headers: csrf_headers, as: :json
      }.to change(Entry, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "別事業所のエントリーには not_found を返す" do
      entry = create(:entry)
      api_sign_in(user)

      delete "/api/entries/#{entry.id}", headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["error"]).to eq("Not found")
    end
  end
end
