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

export default () => {
  const user = useSelector((state) => state.auth.user)

  const [content, setContent] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const loadTimeline = () => {
    authedFetch('timeline', { token: user.token, setError, setLoading }).then(setContent);
  };

  const onRefresh = useCallback(loadTimeline);

  useEffect(loadTimeline, [user]);

  return (
    <View style={styles.container}>
      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}
      {content !== undefined &&
        <FlatList
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ content.tweets }
          renderItem={({ item }) => (<Tweet {...item} currentUser={user} />)}
          refreshControl={
            <RefreshControl refreshing={loading} {...{onRefresh }} />
          }
        />
      }
    </View>
  );
};
