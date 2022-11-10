class AddAvatarToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :avatar, :string, limit: 1024, null: false, default: ''
  end
end
