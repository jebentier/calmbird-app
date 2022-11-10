import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux'
import {
  Text,
  View,
  FlatList,
  RefreshControl,
} from 'react-native';
import FlatListSeparator from '../shared/FlatListSeparator';
import { authedFetch } from '../shared/api';
import Tweet from '../shared/tweet';
import styles from '../shared/styles';

export default Likes = () => {
  const user = useSelector((state) => state.auth.user)

  const [content, setContent] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const loadLikes = () => {
    authedFetch('likes', { token: user.token, setError, setLoading }).then(setContent);
  };

  const onRefresh = useCallback(loadLikes);

  useEffect(loadLikes, [user]);

  const loadMore = () => {
    setError(undefined);
    authedFetch(`likes?next_page=${content.next_page}`, { token: user.token, setError, setLoading }).then((data) => {
      setContent({ ...data, tweets: content.tweets.concat(data.tweets) });
    });
  };

  const FlatListFooter = () => {
    if (content !== undefined && content.next_page !== undefined) {
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
      {content !== undefined &&
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ content.tweets }
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
