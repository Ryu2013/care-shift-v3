require "rails_helper"

RSpec.describe AdminPolicy, type: :policy do
  describe "#allow?" do
    it "管理者を許可する" do
      admin = build(:user, role: :admin)

      expect(AdminPolicy.new(admin, "admin").allow?).to be(true)
    end

    it "従業員を拒否する" do
      employee = build(:user, role: :employee)

      expect(AdminPolicy.new(employee, "admin").allow?).to be(false)
    end
  end
end
