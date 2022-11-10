class ChangeFieldsOnUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :name, :string
    add_column :users, :username, :string
    remove_column :users, :first_name
    remove_column :users, :last_name
  end
end
