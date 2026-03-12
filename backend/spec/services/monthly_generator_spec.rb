require "rails_helper"

RSpec.describe MonthlyGenerator, type: :service do
  let(:office) { create(:office) }
  let(:team) { create(:team, office: office) }
  let(:client) { create(:client, office: office, team: team) }
  let(:month) { Date.new(2025, 2, 1) }

  let!(:need) do
    create(
      :client_need,
      office: office,
      client: client,
      week: :monday,
      shift_type: :day,
      start_time: "09:00",
      end_time: "17:00",
      slots: 2
    )
  end

  let(:target_dates) do # monthに含まれるneed.weekの日付の数
    target_wday = ClientNeed.weeks.fetch(need.week)
    (month.beginning_of_month..month.end_of_month).select { |date| date.wday == target_wday }
  end

  describe "#call" do
    it "指定月の必要枠すべてのシフトを作成する" do
      result = MonthlyGenerator.new(client: client, office: office, month: month).call

      expect(result.created).to eq(target_dates.count * need.slots)
      expect(result.errors).to be_empty

      target_dates.each do |date|
        count = Shift.where(
          office: office,
          client: client,
          date: date,
          shift_type: need.shift_type,
          start_time: need.start_time,
          end_time: need.end_time
        ).count

        expect(count).to eq(need.slots)
      end
    end

    it "一部のシフトが既にある場合は不足分だけ作成する" do
      target_date = target_dates.first
      create(
        :shift,
        office: office,
        client: client,
        date: target_date,
        shift_type: need.shift_type,
        start_time: need.start_time,
        end_time: need.end_time
      )

      result = MonthlyGenerator.new(client: client, office: office, month: month).call

      expect(result.created).to eq((target_dates.count * need.slots) - 1)
      expect(result.errors).to be_empty
      expect(
        Shift.where(
          office: office,
          client: client,
          date: target_date,
          shift_type: need.shift_type,
          start_time: need.start_time,
          end_time: need.end_time
        ).count
      ).to eq(need.slots)
    end

    it "エラー発生時は作成したシフトをすべてロールバックする" do
      raised = false
      # 下のMonthlyGeneratorの中のShift.create!メソッドをラップ
      allow(Shift).to receive(:create!).and_wrap_original do |method, *args|
        unless raised
          raised = true
          raise StandardError, "boom"
        end

        method.call(*args)
      end

      result = MonthlyGenerator.new(client: client, office: office, month: month).call

      expect(result.errors).not_to be_empty
      expect(
        Shift.where(
          office: office,
          client: client,
          shift_type: need.shift_type,
          start_time: need.start_time,
          end_time: need.end_time
        ).count
      ).to eq(0)
    end
  end
end
