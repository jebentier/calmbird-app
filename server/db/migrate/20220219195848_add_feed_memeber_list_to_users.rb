class AddFeedMemeberListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :feed_member_list, :json, default: []
  end
end
