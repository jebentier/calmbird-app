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
import Account from '../shared/account';
import styles from '../shared/styles';

export default function Following() {
  const user = useSelector((state) => state.auth.user)

  const [content, setContent] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const loadFollowing = () => {
    authedFetch('following', { token: user.token, setError, setLoading }).then(setContent);
  };

  const onRefresh = useCallback(loadFollowing);

  useEffect(loadFollowing, [user]);

  return (
    <View style={styles.container}>
      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}
      {content !== undefined &&
        <FlatList
          contentContainerStyle={{ paddingBottom: 25 }}
          data={ content.users }
          renderItem={({ item }) => (<Account {...item} currentUser={user} />)}
          ItemSeparatorComponent={FlatListSeparator}
          refreshControl={
            <RefreshControl refreshing={loading} {...{onRefresh }} />
          }
        />
      }
    </View>
  );
};
