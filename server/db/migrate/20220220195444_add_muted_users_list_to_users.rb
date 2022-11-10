class AddMutedUsersListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :muted_users, :json, default: []
  end
end
