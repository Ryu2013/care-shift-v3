class AddNoteFieldsToServiceRecords < ActiveRecord::Migration[7.2]
  def change
    change_table :service_records, bulk: true do |t|
      t.text :special_note, comment: "特記事項"
      t.text :instruction_note, comment: "指示"
      t.text :report_note, comment: "報告"
      t.string :image_file, comment: "添付画像ファイル"
    end
  end
end
