import React from 'react';
import { useSelector } from 'react-redux'
import {
  Text,
  View,
} from 'react-native';
import styles from '../shared/styles';

export default function Tweets() {
  const user = useSelector((state) => state.auth.user)

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Hi {user.username}!</Text>
      </View>
    </View>
  );
}
