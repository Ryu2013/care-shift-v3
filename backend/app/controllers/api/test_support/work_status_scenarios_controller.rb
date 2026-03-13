class Api::TestSupport::WorkStatusScenariosController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    password = params[:password].presence || "E2E-#{SecureRandom.hex(10)}!safe"
    admin = build_admin(password)
    employee_password = params[:employee_password].presence || "E2E-#{SecureRandom.hex(10)}!staff"
    employee = build_employee_for(admin, employee_password)
    client = admin.office.clients.create!(
      team: admin.team,
      name: params[:client_name].presence || "Playwright 利用者",
      address: params[:client_address].presence || "東京都渋谷区1-2-3"
    )
    date = params[:date].presence ? Date.parse(params[:date]) : Date.current
    shift = admin.office.shifts.create!(
      client: client,
      user: employee,
      date: date,
      start_time: Time.zone.parse("#{date} 09:00"),
      end_time: Time.zone.parse("#{date} 18:00"),
      shift_type: :day,
      work_status: params[:work_status].presence_in(%w[work not_work]) || "work"
    )

    render json: {
      admin: {
        email: admin.email,
        password: password,
        role: admin.role
      },
      employee: {
        name: employee.name,
        email: employee.email,
        password: employee_password
      },
      client: {
        name: client.name
      },
      shift: {
        date: shift.date,
        start_time: shift.start_time.strftime("%H:%M"),
        end_time: shift.end_time.strftime("%H:%M"),
        work_status: shift.work_status
      }
    }, status: :created
  end

  private

  def build_admin(password)
    user = User.new(
      name: params[:admin_name].presence || "Playwright Admin",
      email: params[:admin_email].presence || "playwright-admin-#{SecureRandom.hex(8)}@example.com",
      password: password,
      password_confirmation: password,
      confirmed_at: Time.current
    )
    user.setup_default_office_and_team!
    user.role = :admin
    user.save!
    user
  end

  def build_employee_for(admin, password)
    admin.office.users.create!(
      team: admin.team,
      name: params[:employee_name].presence || "Playwright Staff",
      email: params[:employee_email].presence || "playwright-employee-#{SecureRandom.hex(8)}@example.com",
      password: password,
      password_confirmation: password,
      confirmed_at: Time.current,
      role: :employee
    )
  end
end
