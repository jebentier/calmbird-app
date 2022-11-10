class AddRetweetedTweetsListToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :retweeted_tweets, :json, default: []
  end
end
