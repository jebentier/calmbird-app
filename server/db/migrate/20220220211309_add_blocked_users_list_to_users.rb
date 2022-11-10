class AddBlockedUsersListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :blocked_users, :json, default: []
  end
end
