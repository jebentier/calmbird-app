# frozen_string_literal: true

class MobileController < ApplicationController
  skip_before_action :verify_authenticity_token
  around_action :exception_handling
  before_action :authenticate_jwt_token, except: %i[oauth2_authorize oauth2_finalize]

  TWITTER_SCOPE = ['users.read', 'tweet.read', 'tweet.write', 'offline.access', 'follows.read',
    'follows.write', 'mute.read', 'mute.write', 'like.read', 'like.write', 'list.read',
    'list.write', 'block.read', 'block.write'].freeze

  def feed
    tweets, next_page = @current_user.feed(pagination_token: params[:next_page])
    render json: { tweets:, next_page: }
  end

  def timeline
    tweets, next_page = @current_user.timeline(pagination_token: params[:next_page])
    render json: { tweets:, next_page: }
  end

  def likes
    tweets, next_page = @current_user.likes(pagination_token: params[:next_page])
    render json: { tweets:, next_page: }
  end

  def like_tweet
    @current_user.like_tweet!(params[:id])
    render json: { success: true }
  end

  def unlike_tweet
    @current_user.unlike_tweet!(params[:id])
    render json: { success: true }
  end

  def retweet_tweet
    @current_user.retweet_tweet!(params[:id])
    render json: { success: true }
  end

  def unretweet_tweet
    @current_user.unretweet_tweet!(params[:id])
    render json: { success: true }
  end

  def following
    users, next_page = @current_user.following(pagination_token: params[:next_page])
    render json: { users:, next_page: }
  end

  def follow_user
    @current_user.follow_user!(params[:id])
    render json: { success: true }
  end

  def unfollow_user
    @current_user.unfollow_user!(params[:id])
    render json: { success: true }
  end

  def add_feed
    @current_user.add_to_feed!(params[:id])
    render json: { success: true }
  end

  def remove_feed
    @current_user.remove_from_feed!(params[:id])
    render json: { success: true }
  end

  def block_user
    @current_user.block_user!(params[:id])
    render json: { success: true }
  end

  def unblock_user
    @current_user.unblock_user!(params[:id])
    render json: { success: true }
  end

  def mute_user
    @current_user.mute_user!(params[:id])
    render json: { success: true }
  end

  def unmute_user
    @current_user.unmute_user!(params[:id])
    render json: { success: true }
  end

  def oauth2_authorize
    client = oauth2_client(redirect_uri: params[:callback_url])
    authorization_uri = client.authorization_uri(scope: TWITTER_SCOPE)
    code_verifier     = client.code_verifier
    render json: { authorization_uri:, code_verifier: }
  end

  def oauth2_finalize
    client = oauth2_client(redirect_uri: params[:callback_url])
    client.authorization_code = params[:code]
    token_response = client.access_token!(params[:code_verifier])
    client.refresh_token = token_response.refresh_token
    access_token = client.access_token!

    resource  = RestClient::Resource.new('https://api.twitter.com/2/', headers: { Authorization: "Bearer #{access_token.access_token}" })
    response  = resource['users/me?user.fields=description,id,name,pinned_tweet_id,profile_image_url,username'].get
    user_data = JSON.parse(response.body)

    user = User.from_user_data(user_data['data'])
    user.update!(access_token: access_token.access_token, refresh_token: access_token.refresh_token)

    render json: { id: user.uid, username: user.username, avatar: user.avatar, token: user.jwt_token }
  end

  private

  def authenticate_jwt_token
    @current_user = User.from_jwt_token!(request.headers.fetch('Authorization', ''))
  rescue
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  def oauth2_client(redirect_uri: nil)
    TwitterOAuth2::Client.new(
      identifier:   ENV['TWITTER_API_KEY'],
      secret:       ENV['TWITTER_API_SECRET'],
      redirect_uri:
    )
  end

  def exception_handling
    yield
  rescue RestClient::TooManyRequests => ex
    Rails.logger.warning("Twitter API rate limit exceeded: #{ex.message}")
    render json: { error: 'Action limit exceeded, you should slow down.' }, status: :too_many_requests
  rescue => ex
    Rails.logger.error("Exception: #{ex.class.name} - #{ex.message}")
    render json: { error: ex.message }, status: :internal_server_error
  end
end
