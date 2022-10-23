import React from 'react';
import { useSelector } from 'react-redux'
import {
  Text,
  View,
} from 'react-native';
import styles from '../shared/styles';

export default function Discover() {
  const user = useSelector((state) => state.auth.user)

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Hi {user.username}!</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>The ability to safely and calmly discover new content is coming soon.</Text>
      </View>
    </View>
  );
}
