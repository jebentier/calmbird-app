import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Random from 'expo-random';
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistCombineReducers, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';

import authReducer from './authSlice';

// Unique non-sensitive ID which we use to save the store password
const ENCRYPTION_KEY = 'CALMBIRD_ENCRYPTION_KEY';
const getEncryptionKey = async () => {
  // check for existing credentials
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY);
  if (key) {
    return { isFresh: false, key };
  }

  // generate new credentials based on random string
  const randomBytes = await Random.getRandomBytesAsync(32);
  key = binaryToBase64(randomBytes);

  await SecureStore.setItemAsync(ENCRYPTION_KEY, key);
  return { isFresh: true, key };
};

const generateStore = (secretKey) => {
  const config = {
    key: 'auth',
    storage: AsyncStorage,
    transforms: [
      encryptTransform({ secretKey })
    ],
  };

  const persistedReducer = persistCombineReducers(config, {
    auth: authReducer
  });

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  const persistor = persistStore(store);

  return { store, persistor };
};

export const EncryptionGate = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState({ isFresh: false, key: null });

  useEffect(() => {
    (async () => {
      const { isFresh, key } = await getEncryptionKey();
      setEncryptionKey({ isFresh, key });
    })()
  }, []);

  if (!encryptionKey.key) {
    return null;
  }

  return children(encryptionKey);
};

export const StoreGate = ({ encryptionKey, children }) => {
  const [hasData, setHasData] = useState(false);

  useEffect(() =>{
    (async () => {
      setHasData(await AsyncStorage.getItem('persist:auth'));
    })()
  }, []);

  // hasData hasn't been set, so don't return anything
  if (hasData === false) {
    return null;
  }

  // if the encryption key is fresh, we need to flush AsyncStorage
  if (encryptionKey.isFresh && hasData !== null) {
    AsyncStorage.clear();
  }
  return children(generateStore(encryptionKey.key));
};
