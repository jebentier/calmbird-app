Rails.application.routes.draw do
  devise_for :users

  # Mobile Routes
  post 'mobile/oauth2_authorize',  to: 'mobile#oauth2_authorize'
  post 'mobile/oauth2_finalize',   to: 'mobile#oauth2_finalize'

  get  'mobile/timeline',          to: 'mobile#timeline'

  get  'mobile/feed',              to: 'mobile#feed'
  get  'mobile/feed/add/:id',      to: 'mobile#add_feed'
  get  'mobile/feed/remove/:id',   to: 'mobile#remove_feed'

  get  'mobile/following',         to: 'mobile#following'

  get  'mobile/users/:id/follow',  to: 'mobile#follow_user'
  get  'mobile/users/:id/unfollow',to: 'mobile#unfollow_user'
  get  'mobile/users/:id/block',   to: 'mobile#block_user'
  get  'mobile/users/:id/unblock', to: 'mobile#unblock_user'
  get  'mobile/users/:id/mute',    to: 'mobile#mute_user'
  get  'mobile/users/:id/unmute',  to: 'mobile#unmute_user'

  get  'mobile/likes',                to: 'mobile#likes'
  get  'mobile/tweets/:id/like',      to: 'mobile#like_tweet'
  get  'mobile/tweets/:id/unlike',    to: 'mobile#unlike_tweet'
  get  'mobile/tweets/:id/retweet',   to: 'mobile#retweet_tweet'
  get  'mobile/tweets/:id/unretweet', to: 'mobile#unretweet_tweet'

  # Page Routes

  get '/users/:user_id',   to: 'public#user_profile'
  get '/likes',            to: 'public#likes'
  get '/following',        to: 'public#following'
  get '/discover',         to: 'public#discover'

  # Feed Managament Routes
  get '/feed/add/:user_id',    to: 'public#add_to_feed'
  get '/feed/remove/:user_id', to: 'public#remove_from_feed'

  # Like Management Routes
  get '/tweets/:tweet_id/like',   to: 'public#like_tweet'
  get '/tweets/:tweet_id/unlike', to: 'public#unlike_tweet'

  # Retweet Management Routes
  get '/tweets/:tweet_id/retweet',   to: 'public#retweet'
  get '/tweets/:tweet_id/unretweet', to: 'public#unretweet'

  # Tweet Management Routes
  get  '/tweets',                  to: 'public#tweets'
  get  '/tweets/new',              to: 'public#new_tweet'
  post '/tweets/new',              to: 'public#create_tweet'
  get  '/tweets/:tweet_id/quote',  to: 'public#new_quote_tweet'
  post '/tweets/:tweet_id/quote',  to: 'public#create_quote_tweet'
  get  '/tweets/:tweet_id/reply',  to: 'public#new_reply_tweet'
  post '/tweets/:tweet_id/reply',  to: 'public#create_reply_tweet'
  get  '/tweets/:tweet_id/delete', to: 'public#delete_tweet'
  get  '/tweets/:tweet_id',        to: 'public#conversation'

  # User Mute Management Routes
  get '/users/:user_id/mute',   to: 'public#mute_user'
  get '/users/:user_id/unmute', to: 'public#unmute_user'

  # User Block Management Routes
  get '/users/:user_id/block',   to: 'public#block_user'
  get '/users/:user_id/unblock', to: 'public#unblock_user'

  # Authentication Routes
  get '/twitter',          to: 'public#twitter'
  get '/twitter/callback', to: 'public#twitter_callback'

  root 'public#index'
end
