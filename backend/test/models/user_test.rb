require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @office = Office.create!(name: "Test Office")
    @team = Team.create!(name: "Test Team", office: @office)
    @user = User.create!(
      email: "test@example.com",
      password: "password",
      name: "Test User",
      office: @office,
      team: @team,
      confirmed_at: Time.current
    )
  end

  test "should return true if otp is not required" do
    @user.update!(otp_required_for_login: false)
    assert @user.validate_otp(nil)
    assert @user.validate_otp("123456")
  end

  test "should return false if otp is required but blank" do
    @user.update!(otp_required_for_login: true, otp_secret: User.generate_otp_secret)
    assert_not @user.validate_otp(nil)
    assert_not @user.validate_otp("")
  end

  test "should return true if otp is required and valid" do
    @user.update!(otp_required_for_login: true, otp_secret: User.generate_otp_secret)
    valid_otp = @user.current_otp
    assert @user.validate_otp(valid_otp)
  end

  test "should return false if otp is required and invalid" do
    @user.update!(otp_required_for_login: true, otp_secret: User.generate_otp_secret)
    assert_not @user.validate_otp("000000")
  end
end
