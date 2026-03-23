class RenameBodySupportFieldsAndAddLifeFieldsToServiceRecords < ActiveRecord::Migration[7.2]
  def change
    rename_column :service_records, :cleaning_support, :independence_cleaning_support
    rename_column :service_records, :laundry_support, :independence_laundry_support
    rename_column :service_records, :bed_make, :independence_bed_make_support
    rename_column :service_records, :clothing_arrangement, :independence_clothing_arrangement_support
    rename_column :service_records, :cooking_support, :independence_cooking_support
    rename_column :service_records, :shopping_support, :independence_shopping_support

    change_table :service_records, bulk: true do |t|
      t.boolean :cleaning_room, default: false, null: false, comment: "清掃（居室）"
      t.boolean :cleaning_toilet, default: false, null: false, comment: "清掃（トイレ）"
      t.boolean :cleaning_portable_toilet, default: false, null: false, comment: "清掃（ポータブルトイレ）"
      t.boolean :cleaning_table, default: false, null: false, comment: "清掃（卓上）"
      t.boolean :cleaning_kitchen, default: false, null: false, comment: "清掃（台所）"
      t.boolean :cleaning_bathroom, default: false, null: false, comment: "清掃（浴室）"
      t.boolean :cleaning_entrance, default: false, null: false, comment: "清掃（玄関）"
      t.boolean :garbage_disposal, default: false, null: false, comment: "ゴミ出し"

      t.boolean :laundry_wash, default: false, null: false, comment: "洗濯（洗う）"
      t.boolean :laundry_dry, default: false, null: false, comment: "洗濯（乾燥・物干し）"
      t.boolean :laundry_store, default: false, null: false, comment: "洗濯（取入れ・収納）"
      t.boolean :laundry_iron, default: false, null: false, comment: "洗濯（アイロン）"

      t.boolean :bed_make, default: false, null: false, comment: "ベッドメイク"
      t.boolean :sheet_change, default: false, null: false, comment: "シーツ・カバー交換"
      t.boolean :futon_dry, default: false, null: false, comment: "布団干し"
      t.boolean :clothing_arrangement, default: false, null: false, comment: "衣類の整理"
      t.boolean :clothing_repair, default: false, null: false, comment: "被服の補修"

      t.boolean :cooking, default: false, null: false, comment: "調理"
      t.boolean :cooking_preparation, default: false, null: false, comment: "下拵え"
      t.boolean :meal_serving, default: false, null: false, comment: "配膳・下膳"
      t.text :menu_note, comment: "献立・調理内容"

      t.boolean :shopping_daily_goods, default: false, null: false, comment: "日用品等の買物"
      t.boolean :medicine_pickup, default: false, null: false, comment: "薬の受取り"
      t.integer :money_advance, comment: "預り金額（円）"
      t.integer :money_spent, comment: "購入金額（円）"
      t.integer :money_change, comment: "お釣り（円）"
      t.text :shopping_detail, comment: "内訳"
    end
  end
end
