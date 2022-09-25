import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Button,
  Text,
  View,
} from 'react-native';
import styles from '../shared/styles';

export default function Login({ loading, error, onLogin }) {
  return (
    <View style={styles.container}>
      <View>
        <Button title="Login with Twitter" onPress={onLogin} />
      </View>

      {error !== undefined && <Text style={styles.error}>Error: {error}</Text>}

      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator color="#fff" size="large" animating />
        </View>
      )}
    </View>
  );
}
