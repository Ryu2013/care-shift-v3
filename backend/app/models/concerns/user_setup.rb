module UserSetup
  extend ActiveSupport::Concern

  def setup_default_office_and_team!
    return if office.present? && team.present?

    transaction do
      new_office = Office.create!(name: "未設定会社名")
      self.office = new_office
      self.team = Team.create!(name: "未設定部署名", office: new_office)
      self.role = :admin
    end
  end
end
