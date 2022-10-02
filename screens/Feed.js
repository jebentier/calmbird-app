import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  FlatList,
} from 'react-native';
import { authedFetch } from '../shared/api';
import Tweet from '../shared/tweet';
import styles from '../shared/styles';

export default Feed = () => {
  const user = useSelector((state) => state.auth.user)

  const [feed, setFeed] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    authedFetch('timeline', { token: user.token, setError, setLoading }).then(setFeed);
  }, [user]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator color="#fff" size="large" animating />
        </View>
      )}
      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}
      {feed !== undefined &&
        <FlatList
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ feed.tweets }
          renderItem={({ item }) => (<Tweet {...item} currentUser={user} />)}
        />
      }
    </View>
  );
};
