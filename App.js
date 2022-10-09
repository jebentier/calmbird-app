import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react'

import LoginScreen from './screens/Login';
import FeedScreen from './screens/Feed';
import DiscoverScreen from './screens/Discover';
import LikesScreen from './screens/Likes';
import FollowingScreen from './screens/Following';
import TweetsScreen from './screens/Tweets';

import { EncryptionGate, StoreGate } from './redux/store';
import { logout, selectUser } from './redux/authSlice';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const dispatch = useDispatch();

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
          dispatch(logout());
          props.navigation.toggleDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
}

const App = () => {
  const user = useSelector(selectUser)

  if (user) {
    return (
      <Drawer.Navigator initialRouteName="My Feed" drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="My Feed" component={FeedScreen} />
        <Drawer.Screen name="My Tweets" component={TweetsScreen} />
        <Drawer.Screen name="Likes" component={LikesScreen} />
        <Drawer.Screen name="Following" component={FollowingScreen} />
        <Drawer.Screen name="Discover" component={DiscoverScreen} />
      </Drawer.Navigator>
    );
  }

  return (
    <Drawer.Navigator initialRouteName="Login">
      <Drawer.Screen name="Login" component={LoginScreen} />
    </Drawer.Navigator>
  );
}


export default AppWrapper = () => (
  <EncryptionGate>
    {(encryptionKey) => (
      <StoreGate encryptionKey={encryptionKey}>
        {({ store, persistor }) => (
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NavigationContainer>
                <App />
              </NavigationContainer>
            </PersistGate>
          </Provider>
        )}
      </StoreGate>
    )}
  </EncryptionGate>
);
