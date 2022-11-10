class AddLikedTweetsListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :liked_tweets, :json, default: []
  end
end
