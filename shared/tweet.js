import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { Avatar, Chip } from "@rneui/themed";
import styles from '../shared/styles';

const timestampDisplayOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}

const TweetBadges = ({ like_count, quote_count, retweet_count, reply_count }) => {
  return (
    <View style={{ paddingLeft: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
      {like_count > 0    && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#e91e63", marginRight: 15 }} title='Liked' />}
      {quote_count > 0   && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title='Quoted' />}
      {retweet_count > 0 && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#4caf50", marginRight: 15 }} title='Retweeted' />}
      {reply_count > 0   && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#ff6f00", marginRight: 15 }} title='Replied' />}
    </View>
  );
};

const TweetActions = ({ id, liked = false, retweeted = false }) => {
  return (
    <View style={{ paddingLeft: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#e91e63", marginRight: 15 }} title={liked ? 'Unlike' : 'Like'} />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title='Quote' />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#4caf50", marginRight: 15 }} title={retweeted ? 'Unretweet' : 'Retweet'} />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#ff6f00", marginRight: 15 }} title='Reply' />
    </View>
  );
};

const ReTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId },
  author: { profile_image_url, name, username, id: authorId },
  referenced_tweet: { created_at, text, author: { username: originalAuthor } },
  metrics: { like_count, reply_count, retweet_count, quote_count }
}) => {
  const createdAt = (new Date(created_at)).toLocaleDateString(undefined, timestampDisplayOptions);

  return (
    <View style={styles.tweet}>
      <View style={styles.tweetAuthor}>
        <Avatar size={50} rounded source={{ uri: profile_image_url }} containerStyle={styles.tweetAuthorImage} />
        <View>
          <View style={{ ...styles.tweetAuthor, marginBottom: 0 }}>
            <Text style={styles.tweetAuthorName}>{name}</Text>
            <Text style={styles.tweetAuthorUsername}>@{username}</Text>
          </View>
          <Text style={styles.timestamp}>
            {createdAt}
          </Text>
        </View>
      </View>
      <View style={{ paddingLeft: 60, marginBottom: 10 }}>
        <Text>RT @{originalAuthor}:</Text>
        <Text></Text>
        <Text>{text}</Text>
      </View>
      {currentUserId === authorId ?
        <TweetBadges {...{ like_count, quote_count, retweet_count, reply_count }} /> :
        <TweetActions {...{ id, liked, retweeted }} />}
    </View>
  );
};

const QuotedTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId },
  author: { profile_image_url, name, username, id: authorId },
  created_at,
  text,
  referenced_tweet,
  metrics: { like_count, reply_count, retweet_count, quote_count }
}) => {
  const createdAt = (new Date(created_at)).toLocaleDateString(undefined, timestampDisplayOptions);

  return (
    <View style={styles.tweet}>
      <View style={styles.tweetAuthor}>
        <Avatar size={50} rounded source={{ uri: profile_image_url }} containerStyle={styles.tweetAuthorImage} />
        <View>
          <View style={{ ...styles.tweetAuthor, marginBottom: 0 }}>
            <Text style={styles.tweetAuthorName}>{name}</Text>
            <Text style={styles.tweetAuthorUsername}>@{username}</Text>
          </View>
          <Text style={styles.timestamp}>
            {createdAt}
          </Text>
        </View>
      </View>
      <View style={{ paddingLeft: 60 }}>
        <Text>{text}</Text>
      </View>
      <View style={{ paddingLeft: 60, marginBottom: 10, transform: [{ scale: 0.9 }], maxWidth: '100%' }}>
        <StatusTweet {...referenced_tweet} includeBadges={false} maxNameLength={25} />
      </View>
      {currentUserId === authorId ?
        <TweetBadges {...{ like_count, quote_count, retweet_count, reply_count }} /> :
        <TweetActions {...{ id, liked, retweeted }} />}
    </View>
  );
};

const ReplyTweet = () => {};

const StatusTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId  } = {},
  author: { profile_image_url, name, username, id: authorId },
  created_at,
  text,
  metrics: { like_count, reply_count, retweet_count, quote_count },
  includeBadges = true,
  maxNameLength = 35,
}) => {
  const createdAt = (new Date(created_at)).toLocaleDateString(undefined, timestampDisplayOptions);

  const fullNameLength = name.length + username.length + 1;
  const truncatedName = fullNameLength > maxNameLength ? `${name.slice(0, maxNameLength - username.length - 2)}...` : name;

  return (
    <View style={[styles.tweet, includeBadges ? { borderBottomColor: '#eee', borderBottomWidth: 1 } : { borderColor: '#999', borderWidth: 1, borderRadius: 10 }]}>
      <View style={styles.tweetAuthor}>
        <Avatar size={50} rounded source={{ uri: profile_image_url }} containerStyle={styles.tweetAuthorImage} />
        <View>
          <View style={{ ...styles.tweetAuthor, marginBottom: 0 }}>
            <Text style={styles.tweetAuthorName}>{truncatedName}</Text>
            <Text style={styles.tweetAuthorUsername}>@{username}</Text>
          </View>
          <Text style={styles.timestamp}>
            {createdAt}
          </Text>
        </View>
      </View>
      <View style={{ paddingLeft: 60, marginBottom: 10 }}>
        <Text>{text}</Text>
      </View>
      {includeBadges && currentUserId === authorId && <TweetBadges {...{ like_count, quote_count, retweet_count, reply_count }} />}
      {includeBadges && currentUserId !== authorId && <TweetActions {...{ id, liked, retweeted }} />}
    </View>
  );
};

export default function Tweet({ type, ...props}) {
  switch(type) {
    case 'quoted':
      return <QuotedTweet {...props} />;
    case 'replied_to':
      return <StatusTweet {...props} />;
    case 'retweeted':
      return <ReTweet {...props} />;
    default:
      return <StatusTweet {...props} />;
  }
}
