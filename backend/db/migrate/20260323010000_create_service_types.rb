class CreateServiceTypes < ActiveRecord::Migration[7.2]
  def change
    create_table :service_types do |t|
      t.references :office, null: false, foreign_key: true, comment: "事業所"
      t.string :name, null: false, comment: "サービス種別名"

      t.timestamps
    end
  end
end
