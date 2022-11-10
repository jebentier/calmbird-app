class PublicController < ApplicationController
  TWITTER_SCOPE = [
    'users.read',
    'tweet.read',
    'tweet.write',
    'offline.access',
    'follows.read',
    'follows.write',
    'mute.read',
    'mute.write',
    'like.read',
    'like.write',
    'list.read',
    'list.write',
    'block.read',
    'block.write',
  ].freeze

  before_action :user_logged_in!, except: [:index, :twitter, :twitter_callback]

  # Current User's Feed
  def index
    if current_user
      @feed, @next_page = current_user.feed(pagination_token: params[:pagination_token])
    end

    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:tweets, partial: 'tweets/tweets', locals: { tweets: @feed }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # Current User's Tweets
  def tweets
    @tweets, @next_page = current_user.timeline(pagination_token: params[:pagination_token])
    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:tweets, partial: 'tweets/tweets', locals: { tweets: @tweets }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # View a Specific Conversation
  def conversation
    @tweet                    = current_user.find_tweet(params[:tweet_id])
    @conversation, @next_page = current_user.find_conversation(params[:tweet_id], pagination_token: params[:pagination_token])
    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:replies, partial: 'tweets/tweets', locals: { tweets: @tweets }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # View a Specific User's Profile
  def user_profile
    @user = current_user.user_profile(params[:user_id])
    @tweets, @next_page = current_user.timeline(user_id: @user.id, pagination_token: params[:pagination_token])
    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:tweets, partial: 'tweets/tweets', locals: { tweets: @tweets }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # Current User's Likes
  def likes
    @tweets, @next_page = current_user.likes(pagination_token: params[:pagination_token])
    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:tweets, partial: 'tweets/tweets', locals: { tweets: @tweets }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # Current User's Followings
  def following
    @users, @next_page = current_user.following(pagination_token: params[:pagination_token])
    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:users, partial: 'authors/authors', locals: { authors: @users }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # Discover Through Search
  def discover
    @tweets, @next_page = if params[:query].present?
      current_user.recent_tweets(params[:query], pagination_token: params[:pagination_token])
    end || [[], nil]

    respond_to do |format|
      format.turbo_stream do
        render(
          turbo_stream: turbo_stream.append(:tweets, partial: 'tweets/tweets', locals: { tweets: @tweets }) +
            turbo_stream.update(:pagination, partial: 'shared/pagination', locals: { pagination_token: @next_page })
        )
      end
      format.html
    end
  end

  # Add a User to the current User's Feed List
  def add_to_feed
    current_user.add_to_feed!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Remove a User from the current User's Feed List
  def remove_from_feed
    current_user.remove_from_feed!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Like a Tweet
  def like_tweet
    current_user.like_tweet!(params[:tweet_id])
    redirect_back fallback_location: root_path
  end

  # Unlike a Tweet
  def unlike_tweet
    current_user.unlike_tweet!(params[:tweet_id])
    redirect_back fallback_location: root_path
  end

  # Retweet a Tweet
  def retweet_tweet
    current_user.retweet_tweet!(params[:tweet_id])
    redirect_back fallback_location: root_path
  end

  # Unretweet a Tweet
  def unretweet_tweet
    current_user.unretweet_tweet!(params[:tweet_id])
    redirect_back fallback_location: root_path
  end

  # Form for Creating a New Tweet
  def new_tweet
  end

  # Create a New Tweet
  def create_tweet
    tweet_data = params.require(:tweet)
    tweet_id = current_user.create_tweet(tweet_data[:content], reply_settings: tweet_data[:reply_settings])
    redirect_to url_for(action: :conversation, tweet_id: tweet_id)
  end

  # Form for Creating a New Reply Tweet
  def new_reply_tweet
    @tweet = current_user.find_tweet(params[:tweet_id])
  end

  # Create a New Reply Tweet
  def create_reply_tweet
    tweet_data = params.require(:tweet)
    tweet_id = current_user.create_tweet(tweet_data[:content], reply_to_id: params[:tweet_id])
    redirect_to url_for(action: :conversation, tweet_id: tweet_id)
  end

  # Form for Creating a New Quote Tweet
  def new_quote_tweet
    @tweet = current_user.find_tweet(params[:tweet_id])
  end

  # Create a New Quote Tweet
  def create_quote_tweet
    tweet_data = params.require(:tweet)
    tweet_id = current_user.create_tweet(tweet_data[:content], quote_id: params[:tweet_id])
    redirect_to url_for(action: :conversation, tweet_id: tweet_id)
  end

  # Delete a Tweet
  def delete_tweet
    current_user.delete_tweet!(params[:tweet_id])
    redirect_to root_path
  end

  # Mute a User
  def mute_user
    current_user.mute_user!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Unmute a User
  def unmute_user
    current_user.unmute_user!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Block a User
  def block_user
    current_user.block_user!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Unblock a User
  def unblock_user
    current_user.unblock_user!(params[:user_id])
    redirect_back fallback_location: root_path
  end

  # Initiate Twitter Login Flow
  def twitter
    authorization_uri = client.authorization_uri(scope: TWITTER_SCOPE)
    session['code_verifier'] = client.code_verifier
    session['state']         = client.state
    redirect_to authorization_uri, allow_other_host: true
  end

  # Twitter OAuth2 Callback
  def twitter_callback
    if params[:error].present?
      redirect_to root_path and return
    end
    code = params[:code]
    client.authorization_code = code
    token_response = client.access_token!(session['code_verifier'])
    client.refresh_token = token_response.refresh_token
    access_token = client.access_token!

    resource  = RestClient::Resource.new('https://api.twitter.com/2/', headers: { Authorization: "Bearer #{access_token.access_token}" })
    response  = resource['users/me?user.fields=description,id,name,pinned_tweet_id,profile_image_url,username'].get
    user_data = JSON.parse(response.body)

    user = User.from_user_data(user_data['data'])
    user.update!(access_token: access_token.access_token, refresh_token: access_token.refresh_token)

    sign_in_and_redirect user
  end

  private

  def user_logged_in!
    unless current_user
      respond_to do |format|
        format.json         { render json: { error: 'User not logged in' }, status: :unauthorized }
        format.turbo_stream { redirect_to root_path }
        format.html         { redirect_to root_path }
      end
    end
  end

  def client
    @client ||= TwitterOAuth2::Client.new(
      identifier:   ENV['TWITTER_API_KEY'],
      secret:       ENV['TWITTER_API_SECRET'],
      redirect_uri: url_for(controller: :public, action: :twitter_callback)
    )
  end
end
