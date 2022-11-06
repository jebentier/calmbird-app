import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
} from 'react-native';
import { Avatar, Chip } from "@rneui/themed";
import { authedFetch } from './api';
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
      {/* {quote_count > 0   && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title='Quoted' />} */}
      {retweet_count > 0 && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#4caf50", marginRight: 15 }} title='Retweeted' />}
      {/* {reply_count > 0   && <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#ff6f00", marginRight: 15 }} title='Replied' />} */}
    </View>
  );
};

const TweetActions = ({ id, authToken, liked: likedProp = false, retweeted: retweetedProp = false }) => {
  const [liked, setLiked]         = useState(likedProp);
  const [retweeted, setRetweeted] = useState(retweetedProp);

  const onLike = async () => {
    const verb = liked ? 'unlike' : 'like';
    const response = await authedFetch(`tweets/${id}/${verb}`, { token: authToken });
    response.success && setLiked(!liked);
  };

  const onRetweet = async () => {
    const verb = retweeted ? 'unretweet' : 'retweet';
    const response = await authedFetch(`tweets/${id}/${verb}`, { token: authToken });
    response.success && setRetweeted(!retweeted);
  };

  return (
    <View style={{ paddingLeft: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#e91e63", marginRight: 15 }} title={liked ? 'Unlike' : 'Like'} onPress={onLike} />
      {/* <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title='Quote' /> */}
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#4caf50", marginRight: 15 }} title={retweeted ? 'Unretweet' : 'Retweet'} onPress={onRetweet} />
      {/* <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#ff6f00", marginRight: 15 }} title='Reply' /> */}
    </View>
  );
};

const Attachment = ({ type, ...data}) => {
  switch (type) {
    case 'photo':
      return <Image source={{ uri: data.url }} style={{ width: 100, height: 100, borderRadius: 5, margin: 5 }} />;
    case 'video':
      return <Image source={{ uri: data.preview_image_url }} style={{ width: 100, height: 100, borderRadius: 5, margin: 5 }} />;
    default:
      return null;
  }
};

const ReTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId, token: authToken },
  author: { profile_image_url, name, username, id: authorId },
  referenced_tweet: { created_at, text, author: { username: originalAuthor }, attachments = [] },
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: 250 }}>
          { attachments.map((data) => <Attachment id={data.media_key} {...data} />) }
        </View>
      </View>
      {currentUserId === authorId ?
        <TweetBadges {...{ like_count, quote_count, retweet_count, reply_count }} /> :
        <TweetActions {...{ id, liked, retweeted, authToken }} />}
    </View>
  );
};

const QuotedTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId, token: authToken },
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
        <TweetActions {...{ id, liked, retweeted, authToken }} />}
    </View>
  );
};

const ReplyTweet = () => {};

const StatusTweet = ({
  id,
  liked,
  retweeted,
  currentUser: { id: currentUserId, token: authToken  } = {},
  author: { profile_image_url, name, username, id: authorId },
  created_at,
  text,
  attachments = [],
  metrics: { like_count, reply_count, retweet_count, quote_count },
  includeBadges = true,
  maxNameLength = 35,
}) => {
  const createdAt = (new Date(created_at)).toLocaleDateString(undefined, timestampDisplayOptions);

  const fullNameLength = name.length + username.length + 1;
  const truncatedName = fullNameLength > maxNameLength ? `${name.slice(0, maxNameLength - username.length - 2)}...` : name;

  return (
    <View style={[styles.tweet, includeBadges ? {} : { borderColor: '#999', borderWidth: 1, borderRadius: 10 }]}>
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: 250 }}>
          { attachments.map((data) => <Attachment id={data.media_key} {...data} />) }
        </View>
      </View>
      {includeBadges && currentUserId === authorId && <TweetBadges {...{ like_count, quote_count, retweet_count, reply_count }} />}
      {includeBadges && currentUserId !== authorId && <TweetActions {...{ id, liked, retweeted, authToken }} />}
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
