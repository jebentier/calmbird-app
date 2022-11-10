class AddFollowedUsersListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :followed_users, :json, default: []
  end
end
