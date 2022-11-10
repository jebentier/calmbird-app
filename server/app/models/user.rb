require 'uri/query_params'

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  encrypts :access_token
  encrypts :refresh_token

  before_save :create_priority_list, unless: -> { self.priority_list_id.present? }

  class << self
    def from_user_data(data)
      find_or_initialize_by(uid: data['id']).tap do |user|
        user.name     = data['name']
        user.username = data['username']
        user.avatar   = data['profile_image_url']
        user.provider = 'twitter'
        user.password = Devise.friendly_token[0, 20]
        user.save!
      end
    end

    def from_jwt_token!(token)
      ecdsa_key = OpenSSL::PKey.read(ENV['JWT_ENCRYPTION_KEY'])
      decoded_token = JWT.decode(token, ecdsa_key, true, { algorithm: 'ES256' })
      User.find_by(
        uid: decoded_token[0]['uid'],
        username: decoded_token[0]['username'],
        provider: decoded_token[0]['provider']
      )
    end
  end

  def jwt_token
    ecdsa_key = OpenSSL::PKey.read(ENV['JWT_ENCRYPTION_KEY'])
    JWT.encode({ uid:, username:, provider: }, ecdsa_key, 'ES256')
  end

  def create_tweet(content, reply_to_id: nil, quote_id: nil, reply_settings: nil)
    reply_to_id.present? && quote_id.present? and raise ArgumentError, 'cannot specify both reply_to_id and quote_id'
    content_array = Array.wrap(content)
    first_message = content_array.first
    thread = content_array[1..]

    first_tweet_params = {
      reply_settings: (reply_settings unless reply_to_id.present?),
      text: content_array.first,
      quote_tweet_id: quote_id,
      reply: ({ in_reply_to_tweet_id: reply_to_id } if reply_to_id.present?),
    }.compact

    response = with_refresh { parse_response(client["tweets"].post(first_tweet_params.to_json, 'Content-type': 'application/json')) }
    response.dig(:data, :id).tap do |thread_reply_id|
      content_array[1..].each do |thread_text|
        thread_tweet_params = { text: thread_text, reply: { in_reply_to_tweet_id: thread_reply_id } }
        with_refresh { client["tweets"].post(thread_tweet_params.to_json, 'Content-type': 'application/json') }
      end
    end
  end

  def find_tweet(tweet_id)
    params = URI::QueryParams.dump(
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
    )
    response = with_refresh { parse_response(client["tweets/#{tweet_id}?#{params}"].get) }
    Tweet.from_response(response).first
  end

  def find_conversation(tweet_id, pagination_token: nil)
    params = URI::QueryParams.dump(**{
      max_results: 50,
      query: "conversation_id:#{tweet_id} is:reply",
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
      next_token: pagination_token
    }.compact)
    response = with_refresh { parse_response(client["tweets/search/recent?#{params}"].get) }
    [Tweet.from_response(response), response.dig(:meta, :next_token)]
  end

  def following(pagination_token: nil)
    params = URI::QueryParams.dump(**{
      max_results: 50,
      'user.fields': 'id,name,username,profile_image_url,description',
      pagination_token: pagination_token
    }.compact)
    response = with_refresh { parse_response(client["users/#{uid}/following?#{params}"].get) }
    users = response[:data].map do |user|
      Tweet::Author.from_twitter({
        **user,
        following: true,
        in_feed: feed_member_list.include?(user[:id]),
        muted: muted_users.include?(user[:id]),
        blocked: blocked_users.include?(user[:id])
      })
    end
    update!(followed_users: followed_users.push(*users.map(&:id)).uniq)
    [users, response.dig(:meta, :next_token)]
  end

  def timeline(user_id: nil, pagination_token: nil)
    defaulted_uid = user_id || uid
    params = URI::QueryParams.dump(**{
      max_results: 50,
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
      'pagination_token': pagination_token
    }.compact)
    response = with_refresh { parse_response(client["users/#{defaulted_uid}/tweets?#{params}"].get) }
    [Tweet.from_response(response, likes: liked_tweets, retweets: retweeted_tweets), response.dig(:meta, :next_token)]
  end

  def recent_tweets(search, pagination_token: nil)
    params = URI::QueryParams.dump(**{
      max_results: 50,
      query: search,
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
      next_token: pagination_token
    }.compact)
    response = with_refresh { parse_response(client["tweets/search/recent?#{params}"].get) }
    [Tweet.from_response(response), response.dig(:meta, :next_token)]
  end

  def likes(pagination_token: nil, max_results: 50)
    params = URI::QueryParams.dump(**{
      max_results: max_results,
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
      pagination_token: pagination_token
    }.compact)
    response = with_refresh { parse_response(client["users/#{uid}/liked_tweets?#{params}"].get) }
    tweets = Tweet.from_response(response)
    update!(liked_tweets: liked_tweets.push(*tweets.map(&:id)).uniq)
    tweets = Tweet.from_response(response, likes: liked_tweets, retweets: retweeted_tweets)
    [tweets, response.dig(:meta, :next_token)]
  end

  def delete_all_likes
    pagination_token = nil
    while ((likes, pagination_token = likes(pagination_token: pagination_token, max_results: 50)) && likes.any?)
      puts "Token: #{pagination_token}"
      begin
        likes.each do |like|
          result = with_refresh { client["users/#{uid}/likes/#{like.id}"].delete }
          sleep(15)
        end
        puts "deleted chunk of 50 likes"
      rescue RestClient::TooManyRequests => ex
        reset_in = Time.at(ex.response.headers[:x_rate_limit_reset].to_i) - Time.now
        puts "Rate limited, resting in #{reset_in} seconds"
        sleep(reset_in + 1)
      end
    end
  end

  def delete_all_likes_safe
    loop do
      begin
        return delete_all_likes
      rescue => ex
        puts "Encountered error #{ex.message} => retrying"
      end
    end
  end

  def feed(pagination_token: nil)
    params = URI::QueryParams.dump(**{
      max_results: 50,
      expansions: 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys',
      'tweet.fields': 'author_id,conversation_id,created_at,id,text,public_metrics',
      'user.fields': 'id,name,username,profile_image_url',
      'media.fields': 'media_key,url,preview_image_url,type',
      pagination_token: pagination_token
    }.compact)
    response = with_refresh { parse_response(client["lists/#{priority_list_id}/tweets?#{params}"].get) }
    [Tweet.from_response(response), response.dig(:meta, :next_token)]
  end

  def add_to_feed!(user_id)
    with_refresh { client["lists/#{priority_list_id}/members"].post({ user_id: user_id }.to_json, 'Content-type': 'application/json') }
    update!(feed_member_list: feed_member_list.push(user_id).uniq)
  end

  def remove_from_feed!(user_id)
    with_refresh { client["lists/#{priority_list_id}/members/#{user_id}"].delete }
    update!(feed_member_list: feed_member_list.reject { |id| id == user_id })
  end

  def like_tweet!(tweet_id)
    with_refresh { client["users/#{uid}/likes"].post({ tweet_id: tweet_id }.to_json, 'Content-type': 'application/json') }
    update!(liked_tweets: liked_tweets.push(tweet_id).uniq)
  end

  def unlike_tweet!(tweet_id)
    with_refresh { client["users/#{uid}/likes/#{tweet_id}"].delete }
    update!(liked_tweets: liked_tweets.reject { |id| id == tweet_id })
  end

  def retweet_tweet!(tweet_id)
    with_refresh { client["users/#{uid}/retweets"].post({ tweet_id: tweet_id }.to_json, 'Content-type': 'application/json') }
    update!(liked_tweets: retweeted_tweets.push(tweet_id).uniq)
  end

  def unretweet_tweet!(tweet_id)
    with_refresh { client["users/#{uid}/retweets/#{tweet_id}"].delete }
    update!(liked_tweets: retweeted_tweets.reject { |id| id == tweet_id })
  end

  def delete_tweet!(tweet_id)
    with_refresh { client["tweets/#{tweet_id}"].delete }
  end

  def follow_user!(user_id)
    with_refresh { client["users/#{uid}/following"].post({ target_user_id: user_id }.to_json, 'Content-type': 'application/json') }
    update!(following: following.push(user_id).uniq)
  end

  def unfollow_user!(user_id)
    with_refresh { client["users/#{uid}/following/#{user_id}"].delete }
    update!(following: following.reject { |id| id == user_id })
  end

  def mute_user!(user_id)
    with_refresh { client["users/#{uid}/muting"].post({ target_user_id: user_id }.to_json, 'Content-type': 'application/json') }
    update!(muted_users: muted_users.push(user_id).uniq)
  end

  def unmute_user!(user_id)
    with_refresh { client["users/#{uid}/muting/#{user_id}"].delete }
    update!(muted_users: muted_users.reject { |id| id == user_id })
  end

  def block_user!(user_id)
    with_refresh { client["users/#{uid}/blocking"].post({ target_user_id: user_id }.to_json, 'Content-type': 'application/json') }
    update!(blocked_users: blocked_users.push(user_id).uniq)
  end

  def unblock_user!(user_id)
    with_refresh { client["users/#{uid}/blocking/#{user_id}"].delete }
    update!(blocked_users: blocked_users.reject { |id| id == user_id })
  end

  def user_profile(user_id)
    params = URI::QueryParams.dump(
      expansions: 'pinned_tweet_id',
      'tweet.fields': 'context_annotations,conversation_id,created_at,public_metrics,text',
      'user.fields': 'description,id,name,pinned_tweet_id,profile_image_url,username'
    )
    response = with_refresh { parse_response(client["users/#{user_id}?#{params}"].get) }

    author_data  = response[:data].slice(:id, :name, :username, :profile_image_url, :description)
    pinned_tweet = if (pinned_tweet_data = response.dig(:includes, :tweets, 0))
      Tweet.from_twitter(pinned_tweet_data.merge(author: author_data, type: "tweet"))
    end

    Tweet::Author.from_twitter(author_data.merge(pinned_tweet: pinned_tweet))
  end

  def me
    client['users/me'].get
  end

  private

  def parse_response(response)
    JSON.parse(response.body, symbolize_names: true)
  end

  def client
    @client ||= RestClient::Resource.new('https://api.twitter.com/2/', headers: { Authorization: "Bearer #{access_token}" })
  end

  def email_required?
    false
  end

  def with_refresh
    yield
  rescue RestClient::ExceptionWithResponse => ex
    ex.response.code == 401 or raise
    refresh!
    retry
  end

  def refresh!
    refresh_client = TwitterOAuth2::Client.new(
      identifier: ENV['TWITTER_API_KEY'],
      secret:     ENV['TWITTER_API_SECRET']
    )
    refresh_client.refresh_token = refresh_token
    new_access_token = refresh_client.access_token!
    update!(access_token: new_access_token.access_token, refresh_token: new_access_token.refresh_token)
    @client = nil
  end

  def create_priority_list
    if access_token
      response = with_refresh { parse_response(client['lists'].post({ name: 'calmbird private list', private: true }.to_json, 'Content-type': 'application/json')) }
      self.priority_list_id = response.dig(:data, :id)
    end
  end
end
