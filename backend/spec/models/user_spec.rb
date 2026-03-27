require "rails_helper"

RSpec.describe User, type: :model do
  describe "バリデーション" do
    it "名前とメールアドレスとパスワードと事業所とチームがあれば有効である" do
      expect(build(:user)).to be_valid
    end

    it "名前がなければ無効である" do
      user = build(:user, name: nil)

      expect(user).to be_invalid
      expect(user.errors[:name]).to be_present
    end

    it "メールアドレスがなければ無効である" do
      user = build(:user, email: nil)

      expect(user).to be_invalid
      expect(user.errors[:email]).to be_present
    end

    it "パスワードがなければ無効である" do
      user = build(:user, password: nil, password_confirmation: nil)

      expect(user).to be_invalid
      expect(user.errors[:password]).to be_present
    end

    it "事業所がなければ無効である" do
      user = build(:user)
      user.office = nil

      expect(user).to be_invalid
      expect(user.errors[:office]).to be_present
    end

    it "チームがなければ無効である" do
      user = build(:user)
      user.team = nil

      expect(user).to be_invalid
      expect(user.errors[:team]).to be_present
    end

    it "別事業所のチームは無効である" do
      user = build(:user)
      outside_team = create(:team)
      user.team = outside_team

      expect(user).to be_invalid
      expect(user.errors[:team]).to be_present
    end
  end

  describe "関連削除" do
    let!(:user) { create(:user) }

    it "ユーザーが削除されると利用者担当情報も削除される" do
      create(:user_client, user: user, office: user.office, client: create(:client, office: user.office, team: user.team))

      expect { user.destroy }.to change(UserClient, :count).by(-1)
    end

    it "ユーザーが削除されるとシフトの user_id は nil になる" do
      client = create(:client, office: user.office, team: user.team)
      shift = create(:shift, office: user.office, client: client, user: user)

      expect {
        user.destroy
        shift.reload
      }.not_to change(Shift, :count)
      expect(shift.user_id).to be_nil
    end
  end

  describe "二要素認証" do
    it "OTP コードを生成して消費できる" do
      user = create(:user)
      user.update!(otp_secret: User.generate_otp_secret)

      code = user.current_otp

      expect(code).to be_present
      expect(user.validate_and_consume_otp!(code)).to be(true)
      expect(user.validate_and_consume_otp!(code)).to be(false)
    end
  end

  describe "#setup_default_office_and_team!" do
    it "事業所とチームが未設定ならデフォルトを作成して管理者にする" do
      user = User.new(
        name: "従業員A",
        email: "setup-default@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: :employee
      )

      expect {
        user.setup_default_office_and_team!
      }.to change(Office, :count).by(1)
        .and change(Team, :count).by(1)

      expect(user.office).to be_present
      expect(user.team).to be_present
      expect(user.team.office).to eq(user.office)
      expect(user.office.name).to eq("未設定会社名")
      expect(user.team.name).to eq("未設定部署名")
      expect(user.role).to eq("admin")
    end

    it "事業所とチームが既にあれば何もしない" do
      user = create(:user, role: :employee)

      expect {
        user.setup_default_office_and_team!
      }.not_to change(Office, :count)

      expect(user.office).to be_present
      expect(user.team).to be_present
      expect(user.role).to eq("employee")
    end

    it "チーム作成に失敗したら事業所作成もロールバックする" do
      user = User.new(
        name: "従業員B",
        email: "setup-default-failure@example.com",
        password: "password123",
        password_confirmation: "password123"
      )

      allow(Team).to receive(:create!).and_raise(ActiveRecord::RecordInvalid.new(Team.new))

      expect {
        expect { user.setup_default_office_and_team! }.to raise_error(ActiveRecord::RecordInvalid)
      }.not_to change(Office, :count)

      expect(user.office).to be_present
      expect(user.office).not_to be_persisted
      expect(user.team).to be_nil
    end
  end
end
