class Tweet
  class Metrics
    class << self
      def from_twitter(data)
        new(**data)
      end
    end

    attr_reader :like_count, :retweet_count, :quote_count, :reply_count

    def initialize(like_count: 0, retweet_count: 0, quote_count: 0, reply_count: 0, **_others)
      @like_count    = like_count
      @retweet_count = retweet_count
      @quote_count   = quote_count
      @reply_count   = reply_count
    end
  end

  class Attachment
    class << self
      def from_twitter(data)
        new(**data)
      end
    end

    attr_reader :media_key, :type, :url, :preview_image_url

    def initialize(media_key:, type:, url: nil, preview_image_url: nil, **_others)
      @media_key         = media_key
      @type              = type
      @url               = url
      @preview_image_url = preview_image_url
    end

    def to_partial_path
      "tweets/attachment"
    end
  end

  class Author
    class << self
      def from_twitter(data)
        new(**data)
      end
    end

    attr_reader :id, :username, :name, :profile_image_url, :description, :pinned_tweet, :following, :in_feed, :muted, :blocked

    def initialize(id:, username:, name:, profile_image_url:, description: nil, pinned_tweet: nil, following: false, in_feed: false, muted: false, blocked: false, **_others)
      @id                = id
      @username          = username
      @name              = name
      @profile_image_url = profile_image_url
      @description       = description&.gsub("\u2028", "\n")
      @pinned_tweet      = pinned_tweet
      @following         = following
      @in_feed           = in_feed
      @muted             = muted
      @blocked           = blocked
    end

    def to_partial_path
      "authors/author"
    end
  end

  class << self
    def from_response(response, likes: [], retweets: [])
      Array.wrap(response[:data]).map do |tweet|
        if (referenced_tweet = Array.wrap(response.dig(:includes, :tweets)).find { |rt| tweet.dig(:referenced_tweets, 0, :id) == rt[:id] })
          referenced_tweet_attachments = referenced_tweet.dig(:attachments, :media_keys) || []
          if referenced_tweet_attachments.any?
            referenced_tweet_attachments = referenced_tweet_attachments.map do |media_key|
              (response.dig(:includes, :media) || []).find { |media| media[:media_key] == media_key }
            end.compact
          end

          referenced_tweet = referenced_tweet.merge(
            type: referenced_tweet[:referenced_tweets]&.any? ? tweet.dig(:referenced_tweets, 0, :type) : 'tweet',
            author: response.dig(:includes, :users).find { |user| user[:id] == referenced_tweet[:author_id] },
            attachments: referenced_tweet_attachments,
            liked: likes.include?(referenced_tweet[:id]),
            retweeted: retweets.include?(referenced_tweet[:id])
          )
        end

        attachments = tweet.dig(:attachments, :media_keys) || []
        if attachments.any?
          attachments = attachments.map do |media_key|
            response.dig(:includes, :media).find { |media| media[:media_key] == media_key }
          end.compact
        end

        from_twitter(
          **tweet.slice(:id, :conversation_id, :text, :created_at, :public_metrics),
          type: tweet[:referenced_tweets]&.any? ? tweet.dig(:referenced_tweets, 0, :type) : 'tweet',
          author: response.dig(:includes, :users).find { |user| user[:id] == tweet[:author_id] },
          referenced_tweet: referenced_tweet,
          attachments: attachments,
          liked: likes.include?(tweet[:id]),
          retweeted: retweets.include?(tweet[:id])
        )
      end
    end

    def from_twitter(data)
      new(
        **data.merge(
          author: Author.from_twitter(data[:author]),
          metrics: Metrics.from_twitter(data.dig(:public_metrics)),
          referenced_tweet: data.dig(:referenced_tweet) ? from_twitter(data.dig(:referenced_tweet)) : nil,
          attachments: (data.dig(:attachments) || []).map { |attachment| Attachment.from_twitter(attachment) }
        )
      )
    end
  end

  attr_reader :id, :conversation_id, :text, :author, :created_at, :referenced_tweet, :type, :metrics, :attachments, :liked, :retweeted

  def initialize(
    id:,
    text:,
    author:,
    created_at:,
    type:,
    metrics:,
    conversation_id: nil,
    referenced_tweet: nil,
    attachments: [],
    liked: false,
    retweeted: false,
    **_others
  )
    @id               = id
    @conversation_id  = conversation_id
    @text             = text.gsub("\u2028", "\n")
    @author           = author
    @created_at       = created_at
    @type             = type
    @metrics          = metrics
    @referenced_tweet = referenced_tweet
    @attachments      = attachments
    @liked            = liked
    @retweeted        = retweeted
  end

  def quote?
    type == "quoted"
  end

  def reply?
    type == "replied"
  end

  def retweet?
    referenced_tweet.present? && !reply? && !quote?
  end

  def to_partial_path
    "tweets/tweet"
  end
end
