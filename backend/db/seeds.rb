require "securerandom"

ActiveRecord::Base.transaction do
  office = Office.find_or_create_by!(name: "デモ事業所")
  team   = office.teams.find_or_create_by!(name: "Aチーム")
  client = office.clients.find_or_create_by!(team: team, name: "テスト顧客")

  admin_email    = ENV.fetch("SEED_ADMIN_EMAIL", "admin@example.com")
  admin_password = ENV.fetch("SEED_ADMIN_PASSWORD", "CareShift2024!")

  admin = User.find_or_initialize_by(email: admin_email)
  if admin.new_record?
    admin.assign_attributes(
      name: "管理者",
      office: office,
      team: team,
      role: :admin,
      password: admin_password,
      password_confirmation: admin_password,
      confirmed_at: Time.current
    )
    admin.skip_password_validation = true if admin.respond_to?(:skip_password_validation=)
    admin.save!(validate: false)
    puts "[seed] Admin created => #{admin_email} / #{admin_password}"
  else
    puts "[seed] Admin exists  => #{admin_email}"
  end

  emp_password = "CareShift2024!"
  [
    ["employee1@example.com", "従業員 太郎"],
    ["employee2@example.com", "従業員 次郎"],
    ["employee3@example.com", "従業員 三郎"],
    ["employee4@example.com", "従業員 四郎"]
  ].each do |email, name|
    emp = User.find_or_initialize_by(email: email)
    if emp.new_record?
      emp.assign_attributes(
        name: name,
        office: office,
        team: team,
        role: :employee,
        password: emp_password,
        password_confirmation: emp_password,
        confirmed_at: Time.current
      )
      emp.save!(validate: false)
      puts "[seed] Employee created => #{email} / #{emp_password}"
    else
      puts "[seed] Employee exists  => #{email}"
    end
  end

  puts "[seed] Office: #{office.name} (id=#{office.id})"
  puts "[seed] Team:   #{team.name} (id=#{team.id})"
  puts "[seed] Client: #{client.name} (id=#{client.id})"
end
