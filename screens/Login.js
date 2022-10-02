import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  View,
} from 'react-native';
import styles from '../shared/styles';

import { login } from '../redux/authSlice';

export default function Login() {
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View>
        <Button title="Login with Twitter" onPress={() => dispatch(login())} />
      </View>
    </View>
  );
}
