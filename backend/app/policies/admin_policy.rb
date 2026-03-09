class AdminPolicy < ApplicationPolicy
  def initialize(user, record)
    @user = user
    @record = record
  end

  def allow?
    @user.admin?
  end
end
