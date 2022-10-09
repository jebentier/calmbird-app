import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { Avatar, Chip } from "@rneui/themed";
import styles from '../shared/styles';

const AccountActions = ({ following, inFeed, muted, blocked }) => (
  <View style={{ paddingLeft: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
    <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#009688", marginRight: 15 }} title={following ? 'Unfollow' : 'Follow'} />
    <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "orange", marginRight: 15 }} title={inFeed ? 'Remove from Feed' : 'Add to Feed'} />
    <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "grey", marginRight: 15 }} title={muted ? 'Unmute' : 'Mute'} />
    <Chip size='sm' titleStyle={{ fontSize: 10 }} buttonStyle={{ backgroundColor: "#e91e63", marginRight: 15 }} title={blocked ? 'Unblock' : 'Block'} />
  </View>
);

export default function Account({ profile_image_url, name, username, description, following, inFeed, muted, blocked }) {
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
      <AccountActions {...{ following, inFeed, muted, blocked }} />
    </View>
  );
}
