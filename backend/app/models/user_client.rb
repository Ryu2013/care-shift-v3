class UserClient < ApplicationRecord
  belongs_to :office
  belongs_to :user
  belongs_to :client

  before_validation :set_office_id

  validates :user_id, uniqueness: { scope: :client_id }

  private

  def set_office_id
    self.office_id ||= client&.office_id || user&.office_id
  end
end
