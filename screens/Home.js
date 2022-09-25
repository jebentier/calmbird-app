import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Button,
  Text,
  View,
} from 'react-native';
import styles from '../shared/styles';

const timelineURL = 'http://localhost:3000/mobile/timeline';

export default function Home({ user, loading, error }) {
  const [timeline, setTimeline] = useState();

  const getTimeline = useCallback(async () => {
    const timeline = await fetch(`${timelineURL}`, { headers: { 'Authorization': user.token } }).then((res) => res.json());
    setTimeline(timeline);
  }, [user]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Hi {user.username}!</Text>
        <Button title="Get timeline" onPress={getTimeline} />
      </View>

      {timeline !== undefined && <Text>{JSON.stringify(timeline, 2)}</Text>}

      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}

      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator color="#fff" size="large" animating />
        </View>
      )}
    </View>
  );
}
