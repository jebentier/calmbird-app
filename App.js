import 'react-native-gesture-handler';

import React, { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View } from 'react-native';
import LoginScreen from './screens/Login';
import HomeScreen from './screens/Home';

const oauth2AuthorizationURL = 'http://localhost:3000/mobile/oauth2_authorize';
const oauth2FinalizeURL      = 'http://localhost:3000/mobile/oauth2_finalize';

const redirect = AuthSession.makeRedirectUri({ useProxy: true });

const getAuthURL = async (callback_url) => {
  console.log('Fetching OAuth2 URL fetched...');
  const authUrlResponse = await fetch(
    oauth2AuthorizationURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_url })
    }
  );
  const authUrlData = await authUrlResponse.json();
  console.log('OAuth2 URL fetched!');
  return authUrlData;
};

const finalizeAuth = async (code, code_verifier, callback_url) => {
  console.log('Finalizing OAuth2 flow...');
  const finalizedResponse = await fetch(
    oauth2FinalizeURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier, callback_url })
    }
  );
  const finalizedData = await finalizedResponse.json();
  console.log('OAuth2 flow finalized!');
  return finalizedData;
};

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ onLogout, ...props }) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{justifyContent: 'flex-start'}}>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        label="Logout"
        labelStyle={{ textAlign: 'center' }}
        style={{ paddingTop: 15, paddingBottom: 15, borderTopColor: '#ccc', borderTopWidth: '1px' }}
        onPress={() => {
          onLogout();
          props.navigation.toggleDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function App() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const onLogout = useCallback(() => {
    setUser();
    setLoading(false);
    setError();
  }, []);

  const onLogin = useCallback(async () => {
    setLoading(true);

    try {
      // Step #1 - first we need to fetch an authorization uri to start the browser-based authentication flow
      const authUrlData = await getAuthURL(redirect);

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
      const userData = await finalizeAuth(authResponse.params.code, authUrlData.code_verifier, redirect);

      // Now let's store the user data in our state to render it.
      setUser(userData);
    } catch (error) {
      console.log('Something went wrong...', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // index: 'My Feed',
  // tweets: 'My Tweets',
  // likes: 'Likes',
  // following: 'Following',
  // discover: 'Discover'
  if (user === undefined) {
    return (
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Login">
          <Drawer.Screen name="Login">
            {(props) => <LoginScreen {...props} loading={loading} error={error} onLogin={onLogin} />}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="My Feed" drawerContent={(props) => <CustomDrawerContent {...props} onLogout={onLogout} />}>
        <Drawer.Screen name="My Feed">
          {(props) => <HomeScreen {...props} user={user} loading={loading} error={error} />}
        </Drawer.Screen>
        <Drawer.Screen name="My Tweets">
          {(props) => <HomeScreen {...props} user={user} loading={loading} error={error} />}
        </Drawer.Screen>
        <Drawer.Screen name="Likes">
          {(props) => <HomeScreen {...props} user={user} loading={loading} error={error} />}
        </Drawer.Screen>
        <Drawer.Screen name="Following">
          {(props) => <HomeScreen {...props} user={user} loading={loading} error={error} />}
        </Drawer.Screen>
        <Drawer.Screen name="Discover">
          {(props) => <HomeScreen {...props} user={user} loading={loading} error={error} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
