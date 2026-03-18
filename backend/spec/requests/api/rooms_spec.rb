require "rails_helper"

RSpec.describe "ルームAPI", type: :request do
  let(:user) { create(:user) }
  let(:office) { user.office }
  let(:team) { user.team }

  describe "GET /api/rooms" do
    it "現在の事業所に属するルーム一覧を返す" do
      room = create(:room, office: office, name: "Visible Room")
      create(:entry, room: room, user: user, office: office)
      create(:room)
      api_sign_in(user)

      get "/api/rooms"

      expect(response).to have_http_status(:ok)
      expect(json.map { |row| row["id"] }).to include(room.id)
    end
  end

  describe "GET /api/rooms/:id" do
    it "現在の事業所に属するルーム詳細を返す" do
      room = create(:room, office: office, name: "Visible Room")
      create(:entry, room: room, user: user, office: office)
      api_sign_in(user)

      get "/api/rooms/#{room.id}"

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(room.id)
      expect(json["name"]).to eq("Visible Room")
    end

    it "別事業所のルームには not_found を返す" do
      room = create(:room)
      api_sign_in(user)

      get "/api/rooms/#{room.id}"

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end
  end

  describe "POST /api/rooms" do
    it "ルームと現在ユーザーの参加情報を作成する" do
      api_sign_in(user)

      expect {
        post "/api/rooms", params: { room: { name: "新規ルーム" } }, headers: csrf_headers, as: :json
      }.to change(Room, :count).by(1).and change(Entry, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(Room.last.entries.pluck(:user_id)).to include(user.id)
    end
  end

  describe "PATCH /api/rooms/:id" do
    it "ルームを更新する" do
      room = create(:room, office: office, name: "Old Name")
      create(:entry, room: room, user: user, office: office)
      api_sign_in(user)

      patch "/api/rooms/#{room.id}", params: { room: { name: "New Name" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(room.reload.name).to eq("New Name")
    end

    it "別事業所のルーム更新には not_found を返す" do
      room = create(:room)
      api_sign_in(user)

      patch "/api/rooms/#{room.id}", params: { room: { name: "New Name" } }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end
  end

  describe "DELETE /api/rooms/:id" do
    it "ルームを削除する" do
      room = create(:room, office: office)
      create(:entry, room: room, user: user, office: office)
      api_sign_in(user)

      expect {
        delete "/api/rooms/#{room.id}", headers: csrf_headers, as: :json
      }.to change(Room, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "別事業所のルームには not_found を返す" do
      room = create(:room)
      api_sign_in(user)

      delete "/api/rooms/#{room.id}", headers: csrf_headers, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json["errors"]).to eq([ "Not found" ])
    end
  end
end
