import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux'
import {
  Text,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import { authedFetch } from '../shared/api';
import Tweet from '../shared/tweet';
import styles from '../shared/styles';

export default Feed = () => {
  const user = useSelector((state) => state.auth.user)

  const [feed, setFeed] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const loadFeed = () => {
    authedFetch('feed', { token: user.token, setError, setLoading }).then(setFeed);
  };

  const onRefresh = useCallback(loadFeed);

  useEffect(loadFeed, [user]);

  return (
    <View style={styles.container}>
      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}
      {feed !== undefined &&
        <FlatList
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ feed.tweets }
          renderItem={({ item }) => (<Tweet {...item} currentUser={user} />)}
          refreshControl={
            <RefreshControl refreshing={loading} {...{onRefresh }} />
          }
        />
      }
    </View>
  );
};
