import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../shared/styles';

export default function Likes({ user }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Hi {user.username}!</Text>
      </View>
    </View>
  );
}
