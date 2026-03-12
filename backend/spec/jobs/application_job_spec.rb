require "rails_helper"

RSpec.describe ApplicationJob, type: :job do
  it "`ActiveJob::Base` を継承している" do
    expect(ApplicationJob.superclass).to eq(ActiveJob::Base)
  end
end
