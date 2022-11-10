import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux'
import {
  Text,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import { authedFetch } from '../shared/api';
import FlatListSeparator from '../shared/FlatListSeparator';
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

  const loadMore = () => {
    setError(undefined);
    authedFetch(`feed?next_page=${feed.next_page}`, { token: user.token, setError, setLoading }).then((data) => {
      setFeed({ ...data, tweets: feed.tweets.concat(data.tweets) });
    });
  };

  const FlatListFooter = () => {
    if (feed !== undefined && feed.next_page !== undefined) {
      return (
        <View style={{ width: '100%', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' }}>
          <Text style={{ width: '100%', textAlign: 'center' }} onPress={loadMore}>Load more.</Text>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}
      {feed !== undefined &&
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ feed.tweets }
          renderItem={({ item }) => (<Tweet {...item} currentUser={user} />)}
          ItemSeparatorComponent={FlatListSeparator}
          ListFooterComponent={FlatListFooter}
          refreshControl={
            <RefreshControl refreshing={loading} {...{onRefresh }} />
          }
        />
      }
    </View>
  );
};
