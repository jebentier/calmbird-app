import React, { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import {
  StyleSheet,
  ActivityIndicator,
  Button,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

const oauth2AuthorizationURL = 'http://localhost:3000/mobile/oauth2_authorize';
const oauth2FinalizeURL      = 'http://localhost:3000/mobile/oauth2_finalize';
const timelineURL            = 'http://localhost:3000/mobile/timeline';

const redirect = AuthSession.makeRedirectUri({ useProxy: true });

export default function App() {
  const [user, setUser] = useState();
  const [timeline, setTimeline] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const onLogout = useCallback(() => {
    setUser();
    setTimeline();
    setLoading(false);
    setError();
  }, []);

  const onOauth2Login = useCallback(async () => {
    setLoading(true);

    try {
      // Step #1 - first we need to fetch an authorization uri to start the browser-based authentication flow
      const authUrlResponse = await fetch(
        oauth2AuthorizationURL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_url: redirect })
        }
      );
      const authUrlData = await authUrlResponse.json();
      console.log('OAuth2 URL fetched!');

      // Step #2 - after we received the authorization uri, we can start the auth flow using it
      const authResponse = await AuthSession.startAsync({ authUrl: authUrlData.authorization_uri });
      console.log('Auth response received!');

      // Validate if the auth session response is successful
      // Note, we still receive a `authResponse.type = 'success'`, thats why we need to check on the params itself
      if (authResponse.params && authResponse.params.error) {
        return setError('AuthSession failed, user did not authorize the app');
      }

      // Step #3 - when the user (successfully) authorized the app, we will receive a verification code.
      // With this code we can request an access token and finish the auth flow.
      const { code } = authResponse.params;
      const { code_verifier } = authUrlData;
      const finalizedResponse = await fetch(
        oauth2FinalizeURL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier, callback_url: redirect })
        }
      );
      const finalizedData = await finalizedResponse.json();
      console.log('OAuth2 finalized!');

      // Now let's store the user and token in our state to render it.
      setUser(finalizedData);
    } catch (error) {
      console.log('Something went wrong...', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTimeline = useCallback(async () => {
    const timeline = await fetch(`${timelineURL}`, { headers: { 'Authorization': user.token } }).then((res) => res.json());
    setTimeline(timeline);
  }, [user]);

  return (
    <View style={styles.container}>
      {user !== undefined ? (
        <View>
          <Text style={styles.title}>Hi {user.username}!</Text>
          <Button title="Get timeline" onPress={getTimeline} />
          <Button title="Logout to try again" onPress={onLogout} />
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Example: Twitter login</Text>
          <Button title="Login with Twitter" onPress={onOauth2Login} />
        </View>
      )}

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
