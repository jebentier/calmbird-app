import React, { useState } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { Avatar, Chip } from "@rneui/themed";
import { authedFetch } from './api';
import styles from '../shared/styles';

const AccountActions = ({ id, authToken, following: followingProp, inFeed: inFeedProp, muted: mutedProp, blocked: blockedProp }) => {
  const [following, setFollowing] = useState(followingProp);
  const [inFeed, setInFeed]       = useState(inFeedProp);
  const [muted, setMuted]         = useState(mutedProp);
  const [blocked, setBlocked]     = useState(blockedProp);

  const onFollow = async () => {
    const verb = following ? 'unfollow' : 'follow';
    const response = await authedFetch(`users/${id}/${verb}`, { token: authToken });
    response.success && setFollowing(!following);
  };

  const onMute = async () => {
    const verb = muted ? 'unmute' : 'mute';
    const response = await authedFetch(`users/${id}/${verb}`, { token: authToken });
    response.success && setMuted(!muted);
  };

  const onBlock = async () => {
    const verb = blocked ? 'unblock' : 'block';
    const response = await authedFetch(`users/${id}/${verb}`, { token: authToken });
    response.success && setBlocked(!blocked);
  };

  const onFeed = async () => {
    const verb = inFeed ? 'remove' : 'add';
    const response = await authedFetch(`feed/${verb}/${id}`, { token: authToken });
    response.success && setInFeed(!inFeed);
  };

  return (
    <View style={{ paddingLeft: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title={following ? 'Unfollow' : 'Follow'} onPress={onFollow} />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "orange", marginRight: 15 }} title={inFeed ? 'Remove from Feed' : 'Add to Feed'} onPress={onFeed} />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "grey", marginRight: 15 }} title={muted ? 'Unmute' : 'Mute'} onPress={onMute} />
      <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#e91e63", marginRight: 15 }} title={blocked ? 'Unblock' : 'Block'} onPress={onBlock} />
    </View>
  );
};

export default function Account({ id, profile_image_url, name, username, description, following, inFeed, muted, blocked, currentUser: { token: authToken } }) {
  const maxNameLength  = 35;
  const fullNameLength = name.length + username.length + 1;
  const truncatedName  = fullNameLength > maxNameLength ? `${name.slice(0, maxNameLength - username.length - 2)}...` : name;

  return (
    <View style={styles.tweet}>
      <View style={styles.tweetAuthor}>
        <Avatar size={50} rounded source={{ uri: profile_image_url }} containerStyle={[styles.tweetAuthorImage, { width: '15%' }]} />
        <View style={{ width: '82%', paddingRight: '1%' }}>
          <View style={{ ...styles.tweetAuthor, marginBottom: 0 }}>
            <Text style={styles.tweetAuthorName}>{truncatedName}</Text>
            <Text style={styles.tweetAuthorUsername}>@{username}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1, width: '100%' }}>
            <Text style={styles.descriptionText}>
              {description}
            </Text>
          </View>
        </View>
      </View>
      <AccountActions {...{ id, authToken, following, inFeed, muted, blocked }} />
    </View>
  );
}
