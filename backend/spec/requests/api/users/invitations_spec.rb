require "rails_helper"

RSpec.describe "招待API", type: :request do
  let(:admin) { create(:user, role: :admin, confirmed_at: Time.current, email: "admin-invitation-#{SecureRandom.hex(4)}@example.com") }

  describe "POST /api/users/invitation" do
    it "同じ事業所のチームに招待を送信できる" do
      api_sign_in(admin)

      expect {
        post "/api/users/invitation", params: {
          user: {
            email: "invited-#{SecureRandom.hex(4)}@example.com",
            name: "招待ユーザー",
            team_id: admin.team_id,
            role: "employee"
          }
        }, headers: csrf_headers, as: :json
      }.to change(User, :count).by(1)

      invited_user = User.order(:id).last

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("Invitation sent")
      expect(invited_user.email).to start_with("invited-")
      expect(invited_user.name).to eq("招待ユーザー")
      expect(invited_user.office_id).to eq(admin.office_id)
      expect(invited_user.team_id).to eq(admin.team_id)
      expect(invited_user.role).to eq("employee")
      expect(invited_user.invited_by).to eq(admin)
      expect(invited_user.invitation_token).to be_present
    end

    it "role に admin を渡しても employee として招待する" do
      api_sign_in(admin)

      expect {
        post "/api/users/invitation", params: {
          user: {
            email: "invited-admin-#{SecureRandom.hex(4)}@example.com",
            name: "招待ユーザー",
            team_id: admin.team_id,
            role: "admin"
          }
        }, headers: csrf_headers, as: :json
      }.to change(User, :count).by(1)

      invited_user = User.order(:id).last

      expect(response).to have_http_status(:ok)
      expect(invited_user.role).to eq("employee")
    end

    it "不正なパラメータでは unprocessable_content を返す" do
      api_sign_in(admin)

      post "/api/users/invitation", params: {
        user: {
          email: "",
          name: "招待ユーザー",
          team_id: admin.team_id,
          role: "employee"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to be_present
    end
  end

  describe "PUT /api/users/invitation" do
    it "招待を承認してパスワードを設定できる" do
      invited_user = User.invite!(
        {
          email: "accepted-#{SecureRandom.hex(4)}@example.com",
          name: "承認前ユーザー",
          office: admin.office,
          team: admin.team,
          role: "employee"
        },
        admin
      )

      put "/api/users/invitation", params: {
        user: {
          invitation_token: invited_user.raw_invitation_token,
          name: "承認後ユーザー",
          password: "password123",
          password_confirmation: "password123"
        }
      }, headers: csrf_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("Invitation sent")

      invited_user.reload
      expect(invited_user.name).to eq("承認後ユーザー")
      expect(invited_user.invitation_accepted_at).to be_present
      expect(invited_user.valid_password?("password123")).to be(true)
    end
  end
end
